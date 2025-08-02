<?php

namespace App\Services;

use App\Contracts\Web3AuthServiceInterface;
use App\Contracts\SolanaServiceInterface;
use App\Events\AuthenticationStatusChanged;
use App\Exceptions\Web3AuthenticationException;
use App\Models\Web3User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class Web3AuthService implements Web3AuthServiceInterface
{
  protected SolanaServiceInterface $solanaService;

  public function __construct(SolanaServiceInterface $solanaService)
  {
    $this->solanaService = $solanaService;
  }

  /**
   * Authenticate user with wallet address
   */
  public function authenticate(string $walletAddress, ?string $signature = null, ?string $message = null): ?Web3User
  {
    // Rate limiting
    $this->ensureIsNotRateLimited($walletAddress);

    // Validate wallet address
    if (!$this->solanaService->isValidWalletAddress($walletAddress)) {
      throw ValidationException::withMessages([
        'wallet_address' => config('web3.messages.invalid_wallet'),
      ]);
    }

    // Check token balance
    if (!$this->solanaService->hasSufficientBalance($walletAddress)) {
      throw ValidationException::withMessages([
        'wallet_address' => config('web3.messages.insufficient_balance'),
      ]);
    }

    // Create or update user
    $user = $this->solanaService->createOrUpdateUser($walletAddress);

    if (!$user || !$user->is_authenticated) {
      throw ValidationException::withMessages([
        'wallet_address' => config('web3.messages.authentication_failed'),
      ]);
    }

    // Log in the user
    Auth::guard('web3')->login($user);

    // Dispatch authentication success event
    event(AuthenticationStatusChanged::login($user, [
      'authentication_method' => 'balance_check',
      'wallet_address' => $walletAddress,
      'token_balance' => $user->token_balance,
    ]));

    // Clear rate limit
    $this->clearRateLimit($walletAddress);

    return $user;
  }

  /**
   * Authenticate with signature verification
   */
  public function authenticateWithSignature(string $walletAddress, string $signature, string $message): ?Web3User
  {
    // Verify signature
    if (!$this->solanaService->verifySignature($walletAddress, $message, $signature)) {
      throw ValidationException::withMessages([
        'signature' => 'Invalid signature.',
      ]);
    }

    return $this->authenticate($walletAddress, $signature, $message);
  }

  /**
   * Check if user is authenticated and has sufficient balance
   */
  public function validateUserSession(Web3User $user): bool
  {
    // Check if user still has sufficient balance
    if (!$user->hasSufficientBalance()) {
      // Dispatch balance logout event
      $minBalance = config('web3.min_token_balance', 100000);
      event(AuthenticationStatusChanged::balanceLogout($user, $user->token_balance, $minBalance));
      
      // Logout user if balance is insufficient
      Auth::guard('web3')->logout();
      return false;
    }

    return true;
  }

  /**
   * Refresh user's authentication status
   */
  public function refreshAuthentication(Web3User $user): bool
  {
    $success = $this->solanaService->refreshUserBalance($user);

    if ($success && !$user->hasSufficientBalance()) {
      // Logout user if balance became insufficient
      Auth::guard('web3')->logout();
      return false;
    }

    return $success;
  }

  /**
   * Logout user
   */
  public function logout(): void
  {
    $user = Auth::guard('web3')->user();
    
    if ($user) {
      // Dispatch logout event
      event(AuthenticationStatusChanged::logout($user, 'user_initiated', [
        'logout_method' => 'manual',
      ]));
    }
    
    Auth::guard('web3')->logout();
  }

  /**
   * Get current authenticated user
   */
  public function getCurrentUser(): ?Web3User
  {
    $user = Auth::guard('web3')->user();

    if ($user && !$this->validateUserSession($user)) {
      return null;
    }

    return $user;
  }

  /**
   * Ensure the authentication request is not rate limited
   */
  protected function ensureIsNotRateLimited(string $walletAddress): void
  {
    $maxAttempts = config('web3.balance_check.rate_limit.max_attempts', 10);
    $decayMinutes = config('web3.balance_check.rate_limit.decay_minutes', 1);

    if (RateLimiter::tooManyAttempts($this->throttleKey($walletAddress), $maxAttempts)) {
      $seconds = RateLimiter::availableIn($this->throttleKey($walletAddress));

      throw ValidationException::withMessages([
        'wallet_address' => trans('auth.throttle', [
          'seconds' => $seconds,
          'minutes' => ceil($seconds / 60),
        ]),
      ]);
    }
  }

  /**
   * Clear the rate limit for the request
   */
  protected function clearRateLimit(string $walletAddress): void
  {
    RateLimiter::clear($this->throttleKey($walletAddress));
  }

  /**
   * Get the rate limiting throttle key for the request
   */
  protected function throttleKey(string $walletAddress): string
  {
    return 'web3_auth_' . md5($walletAddress . request()->ip());
  }

  /**
   * Check if user can authenticate (without actually authenticating)
   */
  public function canAuthenticate(string $walletAddress): array
  {
    $result = [
      'can_authenticate' => false,
      'balance' => null,
      'has_sufficient_balance' => false,
      'errors' => [],
    ];

    try {
      // Validate wallet address
      if (!$this->solanaService->isValidWalletAddress($walletAddress)) {
        $result['errors'][] = config('web3.messages.invalid_wallet');
        return $result;
      }

      // Get balance
      $balance = $this->solanaService->getTokenBalance($walletAddress);
      $result['balance'] = $balance;

      if ($balance === null) {
        $result['errors'][] = config('web3.messages.balance_check_failed');
        return $result;
      }

      // Check if sufficient balance
      $result['has_sufficient_balance'] = $balance >= config('web3.min_token_balance');
      $result['can_authenticate'] = $result['has_sufficient_balance'];

      if (!$result['has_sufficient_balance']) {
        $result['errors'][] = config('web3.messages.insufficient_balance');
      }

    } catch (\Exception $e) {
      Log::error('Error checking authentication eligibility', [
        'wallet_address' => $walletAddress,
        'error' => $e->getMessage(),
      ]);
      $result['errors'][] = 'An error occurred while checking authentication eligibility.';
    }

    return $result;
  }
}