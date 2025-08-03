<?php

namespace App\Contracts;

use App\Models\Web3User;
use Illuminate\Support\Collection;

interface TokenBalanceServiceInterface
{
    /**
     * Check and update user's token balance
     */
    public function checkAndUpdateBalance(Web3User $user): bool;

    /**
     * Check balance for multiple users
     */
    public function checkMultipleBalances(Collection $users): array;

    /**
     * Get balance statistics for all users
     */
    public function getBalanceStatistics(): array;

    /**
     * Monitor balance changes for a user
     */
    public function monitorBalanceChanges(Web3User $user, ?int $previousBalance = null): array;

    /**
     * Get users with insufficient balance
     */
    public function getUsersWithInsufficientBalance(): Collection;

    /**
     * Get users with stale balance data
     */
    public function getUsersWithStaleBalance(int $minutes = 5): Collection;

    /**
     * Force refresh balance from blockchain
     */
    public function forceRefreshBalance(Web3User $user): bool;

    /**
     * Get balance history for user (if tracking is enabled)
     */
    public function getBalanceHistory(Web3User $user, int $days = 7): array;

    /**
     * Check if user's balance is sufficient for operation
     */
    public function hasRequiredBalance(Web3User $user, ?int $requiredAmount = null): bool;

    /**
     * Get minimum required balance
     */
    public function getMinimumRequiredBalance(): int;

    /**
     * Clean up stale balance cache
     */
    public function cleanupStaleCache(): int;
}