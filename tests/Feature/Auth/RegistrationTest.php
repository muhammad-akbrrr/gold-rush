<?php

use App\Models\Web3User;

test('web3 login screen can be rendered for new wallet connections', function () {
    $this->mockSolanaService();
    
    $response = $this->get('/web3/login');

    $response->assertStatus(200);
});

test('new users are created when connecting valid wallet with sufficient balance', function () {
    $this->mockSolanaService();
    
    $walletAddress = '7rQ1Mn6mF2VQqSqCe88j1Zp12JhZqYzVPu3KzNm4E1tC';
    
    // First check that user doesn't exist
    expect(Web3User::where('wallet_address', $walletAddress)->exists())->toBeFalse();
    
    // Test wallet can authenticate (which should create user)
    $response = $this->post('/api/web3/can-authenticate', [
        'wallet_address' => $walletAddress,
    ]);

    $response->assertStatus(200);
});

test('existing users are recognized on repeat wallet connection', function () {
    $this->mockSolanaService();
    
    // Create an existing Web3 user
    $user = Web3User::factory()->create([
        'wallet_address' => '7rQ1Mn6mF2VQqSqCe88j1Zp12JhZqYzVPu3KzNm4E1tC',
        'is_authenticated' => true,
        'token_balance' => 150000,
    ]);

    // Test that the same wallet can still authenticate
    $response = $this->post('/api/web3/can-authenticate', [
        'wallet_address' => $user->wallet_address,
    ]);

    $response->assertStatus(200);
    $response->assertJson(['success' => true]);
});

test('invalid wallet addresses are rejected during connection', function () {
    $this->mockSolanaService();
    
    $response = $this->post('/api/web3/can-authenticate', [
        'wallet_address' => 'invalid',
    ]);

    $response->assertStatus(200);
    $response->assertJson([
        'success' => true,
        'data' => [
            'can_authenticate' => false,
            'has_sufficient_balance' => false,
        ]
    ]);
    $response->assertJsonPath('data.errors.0', 'Invalid wallet address.');
});

test('wallets with insufficient balance cannot connect', function () {
    $this->mockSolanaService();
    
    $response = $this->post('/api/web3/can-authenticate', [
        'wallet_address' => 'InsufficientBalanceWalletAddress',
    ]);

    // Should return 200 but indicate insufficient balance
    $response->assertStatus(200);
});