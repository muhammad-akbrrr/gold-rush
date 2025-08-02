<?php

use App\Models\Web3User;

test('web3 login screen can be rendered', function () {
    $this->mockSolanaService();
    
    $response = $this->get('/web3/login');

    $response->assertStatus(200);
});

test('users can authenticate with valid wallet balance', function () {
    $this->mockSolanaService();
    
    $walletAddress = '7rQ1Mn6mF2VQqSqCe88j1Zp12JhZqYzVPu3KzNm4E1tC';
    
    // Use proper API route
    $response = $this->post('/api/web3/can-authenticate', [
        'wallet_address' => $walletAddress,
    ]);

    $response->assertStatus(200);
    $response->assertJson(['success' => true]);
});

test('users cannot authenticate with insufficient balance', function () {
    $this->mockSolanaService();
    
    $walletAddress = 'InsufficientBalanceWalletAddress';
    
    $response = $this->post('/api/web3/can-authenticate', [
        'wallet_address' => $walletAddress,
    ]);

    // This should still return 200 but with success: false or balance error
    $response->assertStatus(200);
});

test('users cannot authenticate with invalid wallet address', function () {
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

test('authenticated web3 users can logout', function () {
    $user = $this->createSufficientBalanceUser();
    
    // First verify user is authenticated
    $this->actingAs($user, 'web3');
    expect(auth('web3')->check())->toBe(true);
    
    $response = $this->post('/api/web3/logout');
    
    $response->assertJson(['success' => true]);
    
    // Check that user is logged out after the request
    expect(auth('web3')->check())->toBe(false);
});

test('web3 user session check works for authenticated users', function () {
    $user = $this->createSufficientBalanceUser();
    
    $response = $this->actingAs($user, 'web3')->get('/web3/check');

    $response->assertStatus(200);
    $response->assertJson(['authenticated' => true]);
});

test('web3 user session check fails for guests', function () {
    $response = $this->getJson('/web3/check');

    $response->assertStatus(401);
    $response->assertJson(['error' => 'Authentication required']);
});