<?php

namespace App\Services;

use App\Contracts\SolanaServiceInterface;
use App\Exceptions\SolanaRpcException;
use App\Exceptions\InvalidWalletAddressException;
use App\Models\Web3User;
use App\Services\BlockiesGeneratorService;
use App\Services\AvatarStorageService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use StephenHill\Base58;

class SolanaService implements SolanaServiceInterface
{
  protected string $rpcUrl;
  protected string $tokenMintAddress;
  protected int $minTokenBalance;
  protected int $tokenDecimals;
  protected BlockiesGeneratorService $blockiesGenerator;
  protected AvatarStorageService $avatarStorage;

  public function __construct(
    BlockiesGeneratorService $blockiesGenerator = null,
    AvatarStorageService $avatarStorage = null
  ) {
    $this->rpcUrl = config('web3.rpc_url');
    $this->tokenMintAddress = config('web3.token_mint_address');
    $this->minTokenBalance = config('web3.min_token_balance');
    $this->tokenDecimals = config('web3.token_decimals');
    $this->blockiesGenerator = $blockiesGenerator ?? new BlockiesGeneratorService();
    $this->avatarStorage = $avatarStorage ?? new AvatarStorageService();
  }

  /**
   * Get token balance for a wallet address
   */
  public function getTokenBalance(string $walletAddress): ?int
  {
    $cacheKey = "token_balance_{$walletAddress}";
    $cacheDuration = config('web3.balance_check.cache_duration', 30);

    // Check cache first
    if (Cache::has($cacheKey)) {
      return Cache::get($cacheKey);
    }

    // Check for configured test wallets (for development only)
    $testWallets = config('web3.test_wallets', []);
    if (!empty($testWallets) && isset($testWallets[$walletAddress])) {
      $mockBalance = $testWallets[$walletAddress];
      Cache::put($cacheKey, $mockBalance, $cacheDuration);
      Log::info('Using configured test wallet balance', [
        'wallet_address' => $walletAddress,
        'balance' => $mockBalance,
      ]);
      return $mockBalance;
    }

    try {
      // Configure HTTP client with SSL options
      $httpClient = Http::timeout(10);

      // Check if SSL verification should be disabled
      if (!config('solana.connection.verify_ssl', true)) {
        $httpClient = $httpClient->withoutVerifying();
      }

      $response = $httpClient->post($this->rpcUrl, [
        'jsonrpc' => '2.0',
        'id' => 1,
        'method' => 'getTokenAccountsByOwner',
        'params' => [
          $walletAddress,
          [
            'mint' => $this->tokenMintAddress,
          ],
          [
            'encoding' => 'jsonParsed',
          ],
        ],
      ]);

      if ($response->successful()) {
        $data = $response->json();

        if (isset($data['result']['value']) && !empty($data['result']['value'])) {
          $account = $data['result']['value'][0];
          $balance = $account['account']['data']['parsed']['info']['tokenAmount']['uiAmount'] ?? 0;

          // uiAmount is already decimal-adjusted, no need to multiply by decimals
          $humanReadableBalance = (int) $balance;

          // Cache the result
          Cache::put($cacheKey, $humanReadableBalance, $cacheDuration);

          return $humanReadableBalance;
        } else {
          // No token account found, balance is 0
          Cache::put($cacheKey, 0, $cacheDuration);
          return 0;
        }
      }
    } catch (\Exception $e) {
      Log::error('Failed to get token balance', [
        'wallet_address' => $walletAddress,
        'error' => $e->getMessage(),
      ]);
    }

    return null;
  }

  /**
   * Validate wallet address format
   */
  public function isValidWalletAddress(string $address): bool
  {
    // Basic Solana address validation (base58, 32-44 characters)
    return preg_match('/^[1-9A-HJ-NP-Za-km-z]{32,44}$/', $address);
  }

  /**
   * Check if wallet has sufficient token balance for authentication
   */
  public function hasSufficientBalance(string $walletAddress): bool
  {
    $balance = $this->getTokenBalance($walletAddress);

    if ($balance === null) {
      return false;
    }

    return $balance >= $this->minTokenBalance;
  }

  /**
   * Create or update Web3 user with token balance
   */
  public function createOrUpdateUser(string $walletAddress, ?string $displayName = null): ?Web3User
  {
    try {
      if (!$this->isValidWalletAddress($walletAddress)) {
        Log::warning('Invalid wallet address provided', ['wallet_address' => $walletAddress]);
        return null;
      }

      $balance = $this->getTokenBalance($walletAddress);

      if ($balance === null) {
        Log::error('Failed to get token balance for wallet', ['wallet_address' => $walletAddress]);
        return null;
      }

      // Prepare user data
      $userData = [
        'token_balance' => $balance,
        'last_balance_check' => now(),
      ];

      // Set display name to wallet address if not provided or empty
      if (empty($displayName)) {
        $userData['display_name'] = $walletAddress;
      } else {
        $userData['display_name'] = $displayName;
      }

      $user = Web3User::updateOrCreate(
        ['wallet_address' => $walletAddress],
        $userData
      );

      // Generate and store avatar if user doesn't have one
      $this->ensureUserHasAvatar($user);

      $user->updateTokenBalance($balance);

      Log::info('Web3 user created/updated successfully', [
        'wallet_address' => $walletAddress,
        'balance' => $balance,
        'is_authenticated' => $user->is_authenticated,
        'has_avatar' => !empty($user->avatar_url),
        'display_name' => $user->display_name,
      ]);

      return $user;
    } catch (\Exception $e) {
      Log::error('Failed to create/update Web3 user', [
        'wallet_address' => $walletAddress,
        'error' => $e->getMessage(),
      ]);
      return null;
    }
  }

  /**
   * Ensure user has an avatar, generate one if missing
   */
  protected function ensureUserHasAvatar(Web3User $user): void
  {
    try {
      // Skip if user already has an avatar
      if (!empty($user->avatar_url)) {
        return;
      }

      // Check if avatar exists in storage but not in database
      $existingAvatarUrl = $this->avatarStorage->getAvatarUrl($user->wallet_address);
      if ($existingAvatarUrl) {
        $user->update(['avatar_url' => $existingAvatarUrl]);
        Log::info('Found existing avatar in storage', [
          'wallet_address' => $user->wallet_address,
          'avatar_url' => $existingAvatarUrl,
        ]);
        return;
      }

      // Generate new avatar
      $imageData = $this->blockiesGenerator->generateBlockies($user->wallet_address);
      if ($imageData === null) {
        Log::error('Failed to generate blockies avatar', [
          'wallet_address' => $user->wallet_address,
        ]);
        return;
      }

      // Store avatar and get URL
      $avatarUrl = $this->avatarStorage->storeAvatar($user->wallet_address, $imageData);
      if ($avatarUrl === null) {
        Log::error('Failed to store avatar', [
          'wallet_address' => $user->wallet_address,
        ]);
        return;
      }

      // Update user with avatar URL
      $user->update(['avatar_url' => $avatarUrl]);

      Log::info('Generated and stored new avatar', [
        'wallet_address' => $user->wallet_address,
        'avatar_url' => $avatarUrl,
        'image_size' => strlen($imageData),
      ]);

    } catch (\Exception $e) {
      Log::error('Exception while ensuring user has avatar', [
        'wallet_address' => $user->wallet_address,
        'error' => $e->getMessage(),
      ]);
    }
  }

  /**
   * Get token information
   */
  public function getTokenInfo(): array
  {
    return [
      'mint_address' => $this->tokenMintAddress,
      'min_balance' => $this->minTokenBalance, // Already in human-readable format
      'decimals' => $this->tokenDecimals,
      'network' => config('web3.network'),
    ];
  }

  /**
   * Refresh user's token balance
   */
  public function refreshUserBalance(Web3User $user): bool
  {
    $balance = $this->getTokenBalance($user->wallet_address);

    if ($balance !== null) {
      $user->updateTokenBalance($balance);
      return true;
    }

    return false;
  }

  /**
   * Verify wallet signature (for authentication)
   */
  public function verifySignature(string $walletAddress, string $message, string $signature): bool
  {
    try {
      // Basic input validation
      if (!$this->isValidWalletAddress($walletAddress) || empty($message) || empty($signature)) {
        return false;
      }

      // For development/testing, check if signature verification is disabled
      if (config('web3.disable_signature_verification', false)) {
        Log::warning('Signature verification is disabled - development mode only');
        return true;
      }

      // Implement proper Ed25519 signature verification
      // This requires the sodium extension or a Solana-specific library
      if (!extension_loaded('sodium')) {
        Log::error('Sodium extension not available for signature verification');
        return false;
      }

      // Decode the wallet address (base58 to bytes)
      $base58 = new Base58();
      $publicKeyBytes = $base58->decode($walletAddress);
      if (!$publicKeyBytes || strlen($publicKeyBytes) !== 32) {
        Log::error('Invalid wallet address format for signature verification');
        return false;
      }

      // Decode the signature (base58 to bytes)
      $signatureBytes = $base58->decode($signature);
      if (!$signatureBytes || strlen($signatureBytes) !== 64) {
        Log::error('Invalid signature format');
        return false;
      }

      // Verify the signature using ed25519
      $isValid = sodium_crypto_sign_verify_detached(
        $signatureBytes,
        $message,
        $publicKeyBytes
      );

      Log::info('Signature verification completed', [
        'wallet_address' => $walletAddress,
        'valid' => $isValid
      ]);

      return $isValid;
    } catch (\Exception $e) {
      Log::error('Signature verification failed with exception', [
        'wallet_address' => $walletAddress,
        'error' => $e->getMessage()
      ]);
      return false;
    }
  }


  /**
   * Get network status
   */
  public function getNetworkStatus(): array
  {
    try {
      // Configure HTTP client with SSL options
      $httpClient = Http::timeout(5);

      // Check if SSL verification should be disabled
      if (!config('solana.connection.verify_ssl', true)) {
        $httpClient = $httpClient->withoutVerifying();
      }

      $response = $httpClient->post($this->rpcUrl, [
        'jsonrpc' => '2.0',
        'id' => 1,
        'method' => 'getHealth',
      ]);

      return [
        'status' => $response->successful() ? 'connected' : 'disconnected',
        'network' => config('web3.network'),
        'rpc_url' => $this->rpcUrl,
      ];
    } catch (\Exception $e) {
      return [
        'status' => 'error',
        'network' => config('web3.network'),
        'rpc_url' => $this->rpcUrl,
        'error' => $e->getMessage(),
      ];
    }
  }
}