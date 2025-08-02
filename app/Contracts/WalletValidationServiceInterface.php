<?php

namespace App\Contracts;

interface WalletValidationServiceInterface
{
    /**
     * Validate a wallet address
     */
    public function validate(string $walletAddress): array;

    /**
     * Check if wallet address is valid
     */
    public function isValid(string $walletAddress): bool;

    /**
     * Validate address format
     */
    public function validateFormat(string $address): bool;

    /**
     * Validate address length
     */
    public function validateLength(string $address): bool;

    /**
     * Validate address characters
     */
    public function validateCharacters(string $address): bool;

    /**
     * Get validation errors for an address
     */
    public function getValidationErrors(string $walletAddress): array;

    /**
     * Sanitize wallet address input
     */
    public function sanitize(string $walletAddress): string;

    /**
     * Check if address is in blacklist
     */
    public function isBlacklisted(string $walletAddress): bool;

    /**
     * Check if address is in whitelist (if whitelist mode is enabled)
     */
    public function isWhitelisted(string $walletAddress): bool;

    /**
     * Validate multiple wallet addresses
     */
    public function validateMultiple(array $walletAddresses): array;

    /**
     * Get detailed validation result with context
     */
    public function validateWithContext(string $walletAddress, array $context = []): array;
}