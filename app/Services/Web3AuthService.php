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
   * Authenticate user with wallet address (balance-based authentication)
   */
  public function authenticateWithBalance(string $walletAddress): ?Web3User
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
    $this->clearRateLimitInternal($walletAddress);

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

    return $this->authenticateWithBalance($walletAddress);
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
   * Logout user (internal method)
   */
  public function logoutUser(): void
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
   * Clear the rate limit for the request (internal method)
   */
  protected function clearRateLimitInternal(string $walletAddress): void
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

  // Interface implementations

  /**
   * Authenticate user with wallet address and signature (interface method)
   */
  public function authenticate(string $walletAddress, string $message, string $signature, ?string $displayName = null): ?Web3User
  {
    return $this->authenticateWithSignature($walletAddress, $signature, $message);
  }

  /**
   * Login user to the session
   */
  public function login(Web3User $user, Request $request): bool
  {
    Auth::guard('web3')->login($user);
    return Auth::guard('web3')->check();
  }

  /**
   * Logout user from the session
   */
  public function logout(Request $request): bool
  {
    $this->logoutUser();
    return !Auth::guard('web3')->check();
  }

  /**
   * Check if user is authenticated
   */
  public function isAuthenticated(Request $request): bool
  {
    return Auth::guard('web3')->check();
  }

  /**
   * Get the authenticated user
   */
  public function getAuthenticatedUser(Request $request): ?Web3User
  {
    return $this->getCurrentUser();
  }

  /**
   * Validate authentication session
   */
  public function validateSession(Request $request): bool
  {
    $user = Auth::guard('web3')->user();
    return $user ? $this->validateUserSession($user) : false;
  }

  /**
   * Check rate limiting for authentication attempts
   */
  public function checkRateLimit(string $walletAddress, string $ipAddress): bool
  {
    try {
      $this->ensureIsNotRateLimited($walletAddress);
      return true;
    } catch (ValidationException $e) {
      return false;
    }
  }

  /**
   * Clear rate limiting for successful authentication
   */
  public function clearRateLimit(string $walletAddress, string $ipAddress): void
  {
    $this->clearRateLimitInternal($walletAddress);
  }

  /**
   * Generate authentication challenge message
   */
  public function generateChallengeMessage(string $walletAddress): string
  {
    $timestamp = now()->timestamp;
    $nonce = bin2hex(random_bytes(16));
    
    return "Please sign this message to authenticate with your wallet:\n\n" .
           "Wallet: {$walletAddress}\n" .
           "Timestamp: {$timestamp}\n" .
           "Nonce: {$nonce}";
  }

  /**
   * Validate challenge message format
   */
  public function validateChallengeMessage(string $message): bool
  {
    return str_contains($message, 'Please sign this message to authenticate') &&
           str_contains($message, 'Wallet:') &&
           str_contains($message, 'Timestamp:') &&
           str_contains($message, 'Nonce:');
  }

  /**
   * Clean up expired sessions
   */
  public function cleanupExpiredSessions(): int
  {
    // This would typically clean up from a sessions table
    // For now, return 0 as Laravel handles session cleanup automatically
    return 0;
  }

  /**
   * Get authentication statistics
   */
  public function getAuthenticationStatistics(): array
  {
    $totalUsers = Web3User::count();
    $authenticatedUsers = Web3User::where('is_authenticated', true)->count();
    $recentLogins = Web3User::where('last_balance_check', '>=', now()->subDay())->count();
    
    return [
      'total_users' => $totalUsers,
      'authenticated_users' => $authenticatedUsers,
      'recent_logins_24h' => $recentLogins,
      'authentication_rate' => $totalUsers > 0 ? ($authenticatedUsers / $totalUsers) * 100 : 0,
    ];
  }

  /**
   * Check if user should be logged out due to insufficient balance
   */
  public function shouldLogoutDueToBalance(Web3User $user): bool
  {
    return !$user->hasSufficientBalance();
  }
}