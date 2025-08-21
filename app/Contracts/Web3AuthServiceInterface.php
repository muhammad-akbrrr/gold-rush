<?php

namespace App\Contracts;

use App\Models\Web3User;
use Illuminate\Http\Request;

interface Web3AuthServiceInterface
{
    /**
     * Authenticate user with wallet address and signature
     */
    public function authenticate(string $walletAddress, string $message, string $signature, ?string $displayName = null): ?Web3User;

    /**
     * Login user to the session
     */
    public function login(Web3User $user, Request $request): bool;

    /**
     * Logout user from the session
     */
    public function logout(Request $request): bool;

    /**
     * Check if user is authenticated
     */
    public function isAuthenticated(Request $request): bool;

    /**
     * Get the authenticated user
     */
    public function getAuthenticatedUser(Request $request): ?Web3User;

    /**
     * Validate authentication session
     */
    public function validateSession(Request $request): bool;

    /**
     * Refresh user authentication status
     */
    public function refreshAuthentication(Web3User $user): bool;

    /**
     * Check rate limiting for authentication attempts
     */
    public function checkRateLimit(string $walletAddress, string $ipAddress): bool;

    /**
     * Clear rate limiting for successful authentication
     */
    public function clearRateLimit(string $walletAddress, string $ipAddress): void;


    /**
     * Clean up expired sessions
     */
    public function cleanupExpiredSessions(): int;

    /**
     * Get authentication statistics
     */
    public function getAuthenticationStatistics(): array;

    /**
     * Check if user should be logged out due to insufficient balance
     */
    public function shouldLogoutDueToBalance(Web3User $user): bool;
}