<?php

namespace App\Services;

use App\Contracts\SolanaServiceInterface;
use App\Exceptions\SolanaRpcException;
use App\Exceptions\InvalidWalletAddressException;
use App\Models\Web3User;
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

  public function __construct()
  {
    $this->rpcUrl = config('web3.rpc_url');
    $this->tokenMintAddress = config('web3.token_mint_address');
    $this->minTokenBalance = config('web3.min_token_balance');
    $this->tokenDecimals = config('web3.token_decimals');
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
      $response = Http::timeout(10)->post($this->rpcUrl, [
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

          // Convert to smallest unit (considering decimals)
          $balanceInSmallestUnit = (int) ($balance * pow(10, $this->tokenDecimals));

          // Cache the result
          Cache::put($cacheKey, $balanceInSmallestUnit, $cacheDuration);

          return $balanceInSmallestUnit;
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

      $user = Web3User::updateOrCreate(
        ['wallet_address' => $walletAddress],
        [
          'display_name' => $displayName,
          'token_balance' => $balance,
          'last_balance_check' => now(),
        ]
      );

      $user->updateTokenBalance($balance);

      Log::info('Web3 user created/updated successfully', [
        'wallet_address' => $walletAddress,
        'balance' => $balance,
        'is_authenticated' => $user->is_authenticated,
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
   * Get token information
   */
  public function getTokenInfo(): array
  {
    return [
      'mint_address' => $this->tokenMintAddress,
      'min_balance' => $this->minTokenBalance,
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
      $response = Http::timeout(5)->post($this->rpcUrl, [
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