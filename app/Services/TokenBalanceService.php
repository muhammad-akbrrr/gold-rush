<?php

namespace App\Services;

use App\Contracts\TokenBalanceServiceInterface;
use App\Contracts\SolanaServiceInterface;
use App\Exceptions\InsufficientTokenBalanceException;
use App\Models\Web3User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class TokenBalanceService implements TokenBalanceServiceInterface
{
  protected SolanaServiceInterface $solanaService;

  public function __construct(SolanaServiceInterface $solanaService)
  {
    $this->solanaService = $solanaService;
  }

  /**
   * Check and update user's token balance
   */
  public function checkAndUpdateBalance(Web3User $user): bool
  {
    try {
      $balance = $this->solanaService->getTokenBalance($user->wallet_address);

      if ($balance !== null) {
        $user->updateTokenBalance($balance);
        return true;
      }
    } catch (\Exception $e) {
      Log::error('Failed to check and update balance', [
        'wallet_address' => $user->wallet_address,
        'error' => $e->getMessage(),
      ]);
    }

    return false;
  }

  /**
   * Get cached balance for a wallet address
   */
  public function getCachedBalance(string $walletAddress): ?int
  {
    $cacheKey = "token_balance_{$walletAddress}";
    return Cache::get($cacheKey);
  }

  /**
   * Clear cached balance for a wallet address
   */
  public function clearCachedBalance(string $walletAddress): void
  {
    $cacheKey = "token_balance_{$walletAddress}";
    Cache::forget($cacheKey);
  }

  /**
   * Check if balance is stale and needs refresh
   */
  public function isBalanceStale(Web3User $user): bool
  {
    if (!$user->last_balance_check) {
      return true;
    }

    $cacheDuration = config('web3.balance_check.cache_duration', 30);
    $staleThreshold = now()->subSeconds($cacheDuration);

    return $user->last_balance_check->lt($staleThreshold);
  }

  /**
   * Force refresh balance for a user
   */
  public function forceRefreshBalance(Web3User $user): bool
  {
    // Clear cache first
    $this->clearCachedBalance($user->wallet_address);

    // Check and update balance
    return $this->checkAndUpdateBalance($user);
  }

  /**
   * Batch check balances for multiple users
   */
  public function batchCheckBalances(array $users): array
  {
    $results = [];

    foreach ($users as $user) {
      $results[$user->wallet_address] = [
        'success' => $this->checkAndUpdateBalance($user),
        'balance' => $user->token_balance,
        'is_authenticated' => $user->is_authenticated,
      ];
    }

    return $results;
  }

  /**
   * Monitor balance changes and trigger events
   */
  public function monitorBalanceChangesInternal(Web3User $user): array
  {
    $oldBalance = $user->token_balance;
    $oldAuthenticated = $user->is_authenticated;

    $success = $this->checkAndUpdateBalance($user);

    if (!$success) {
      return [
        'success' => false,
        'changes' => [],
      ];
    }

    $changes = [];

    // Check if balance changed
    if ($oldBalance !== $user->token_balance) {
      $changes['balance'] = [
        'old' => $oldBalance,
        'new' => $user->token_balance,
        'difference' => $user->token_balance - $oldBalance,
      ];
    }

    // Check if authentication status changed
    if ($oldAuthenticated !== $user->is_authenticated) {
      $changes['authentication'] = [
        'old' => $oldAuthenticated,
        'new' => $user->is_authenticated,
        'reason' => $user->is_authenticated ? 'balance_sufficient' : 'balance_insufficient',
      ];
    }

    return [
      'success' => true,
      'changes' => $changes,
    ];
  }

  /**
   * Get balance statistics
   */
  public function getBalanceStatistics(): array
  {
    $totalUsers = Web3User::count();
    $authenticatedUsers = Web3User::where('is_authenticated', true)->count();
    $insufficientBalanceUsers = Web3User::where('is_authenticated', false)->count();

    $averageBalance = Web3User::avg('token_balance') ?? 0;
    $maxBalance = Web3User::max('token_balance') ?? 0;
    $minBalance = Web3User::min('token_balance') ?? 0;

    return [
      'total_users' => $totalUsers,
      'authenticated_users' => $authenticatedUsers,
      'insufficient_balance_users' => $insufficientBalanceUsers,
      'authentication_rate' => $totalUsers > 0 ? ($authenticatedUsers / $totalUsers) * 100 : 0,
      'average_balance' => (int) $averageBalance,
      'max_balance' => (int) $maxBalance,
      'min_balance' => (int) $minBalance,
    ];
  }

  /**
   * Get users with stale balances
   */
  public function getUsersWithStaleBalances(): \Illuminate\Database\Eloquent\Collection
  {
    return Web3User::where(function ($query) {
      $cacheDuration = config('web3.balance_check.cache_duration', 30);
      $staleThreshold = now()->subSeconds($cacheDuration);

      $query->whereNull('last_balance_check')
        ->orWhere('last_balance_check', '<', $staleThreshold);
    })->get();
  }

  /**
   * Refresh all stale balances
   */
  public function refreshAllStaleBalances(): array
  {
    $staleUsers = $this->getUsersWithStaleBalances();
    return $this->batchCheckBalances($staleUsers->all());
  }

  // Interface implementations

  /**
   * Check balance for multiple users
   */
  public function checkMultipleBalances(Collection $users): array
  {
    return $this->batchCheckBalances($users->all());
  }

  /**
   * Monitor balance changes for a user (interface implementation)
   */
  public function monitorBalanceChanges(Web3User $user, ?int $previousBalance = null): array
  {
    // Use the existing method but with proper parameter handling
    if ($previousBalance !== null) {
      $oldBalance = $previousBalance;
      $success = $this->checkAndUpdateBalance($user);
      
      return [
        'user_id' => $user->id,
        'wallet_address' => $user->wallet_address,
        'previous_balance' => $oldBalance,
        'current_balance' => $user->token_balance,
        'balance_changed' => $oldBalance !== $user->token_balance,
        'success' => $success,
      ];
    }
    
    // Use existing internal method when no previous balance provided
    return $this->monitorBalanceChangesInternal($user);
  }

  /**
   * Get users with insufficient balance
   */
  public function getUsersWithInsufficientBalance(): Collection
  {
    $minBalance = config('web3.min_token_balance', 100000);
    return Web3User::where('token_balance', '<', $minBalance)->get();
  }

  /**
   * Get users with stale balance data
   */
  public function getUsersWithStaleBalance(int $minutes = 5): Collection
  {
    $staleThreshold = now()->subMinutes($minutes);
    
    return Web3User::where(function ($query) use ($staleThreshold) {
      $query->whereNull('last_balance_check')
        ->orWhere('last_balance_check', '<', $staleThreshold);
    })->get();
  }

  /**
   * Get balance history for user (if tracking is enabled)
   */
  public function getBalanceHistory(Web3User $user, int $days = 7): array
  {
    // For now, return current balance only
    // In a real implementation, you would have a balance_history table
    return [
      [
        'date' => $user->last_balance_check?->toDateString() ?? now()->toDateString(),
        'balance' => $user->token_balance,
        'timestamp' => $user->last_balance_check?->toISOString() ?? now()->toISOString(),
      ]
    ];
  }

  /**
   * Check if user's balance is sufficient for operation
   */
  public function hasRequiredBalance(Web3User $user, ?int $requiredAmount = null): bool
  {
    $required = $requiredAmount ?? $this->getMinimumRequiredBalance();
    return $user->token_balance >= $required;
  }

  /**
   * Get minimum required balance
   */
  public function getMinimumRequiredBalance(): int
  {
    return config('web3.min_token_balance', 100000);
  }

  /**
   * Clean up stale balance cache
   */
  public function cleanupStaleCache(): int
  {
    $staleUsers = $this->getUsersWithStaleBalance();
    $count = 0;
    
    foreach ($staleUsers as $user) {
      $this->clearCachedBalance($user->wallet_address);
      $count++;
    }
    
    return $count;
  }
}