<?php

namespace Tests;

use App\Models\Web3User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Set up the test environment.
     */
    protected function setUp(): void
    {
        parent::setUp();
        
        // Configure Web3 auth guard as default for testing
        config(['auth.defaults.guard' => 'web3']);
        
        // Configure basic Web3 settings for tests
        config([
            'web3.min_token_balance' => 100000,
            'web3.messages.invalid_wallet' => 'Invalid wallet address.',
            'web3.messages.insufficient_balance' => 'Insufficient token balance.',
            'web3.messages.authentication_failed' => 'Authentication failed.',
        ]);
    }

    /**
     * Create and authenticate a Web3 user for testing.
     */
    protected function actingAsWeb3User($user = null)
    {
        $user = $user ?: Web3User::factory()->create([
            'is_authenticated' => true,
            'token_balance' => config('web3.min_token_balance', 100000),
        ]);
        
        return $this->actingAs($user, 'web3');
    }

    /**
     * Create a Web3 user with insufficient balance.
     */
    protected function createInsufficientBalanceUser()
    {
        return Web3User::factory()->create([
            'is_authenticated' => false,
            'token_balance' => 50000, // Below minimum
        ]);
    }

    /**
     * Create a Web3 user with sufficient balance.
     */
    protected function createSufficientBalanceUser()
    {
        return Web3User::factory()->create([
            'is_authenticated' => true,
            'token_balance' => config('web3.min_token_balance', 100000) + 50000,
        ]);
    }


    /**
     * Mock the Solana service for testing.
     */
    protected function mockSolanaService()
    {
        $this->app->bind('solana', function () {
            return new class {
                public function getTokenInfo() {
                    return ['name' => 'Test Token', 'symbol' => 'TEST'];
                }
                
                public function getNetworkStatus() {
                    return ['status' => 'active', 'network' => 'testnet'];
                }
                
                public function isValidWalletAddress($address) {
                    return strlen($address) >= 32 && strlen($address) <= 44;
                }
                
                public function hasSufficientBalance($address) {
                    return !str_contains($address, 'Insufficient');
                }
                
                public function getTokenBalance($address) {
                    return str_contains($address, 'Insufficient') ? 50000 : 150000;
                }
            };
        });
    }
}
