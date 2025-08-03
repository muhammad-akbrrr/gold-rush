<?php

namespace App\Contracts;

use App\Models\Web3User;

interface SolanaServiceInterface
{
    /**
     * Get token balance for a wallet address
     */
    public function getTokenBalance(string $walletAddress): ?int;

    /**
     * Validate wallet address format
     */
    public function isValidWalletAddress(string $address): bool;

    /**
     * Check if wallet has sufficient token balance for authentication
     */
    public function hasSufficientBalance(string $walletAddress): bool;

    /**
     * Create or update Web3 user with token balance
     */
    public function createOrUpdateUser(string $walletAddress, ?string $displayName = null): ?Web3User;

    /**
     * Get token information
     */
    public function getTokenInfo(): array;

    /**
     * Refresh user's token balance
     */
    public function refreshUserBalance(Web3User $user): bool;

    /**
     * Verify wallet signature (for authentication)
     */
    public function verifySignature(string $walletAddress, string $message, string $signature): bool;

    /**
     * Get network status
     */
    public function getNetworkStatus(): array;
}