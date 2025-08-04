<?php

use App\Models\Web3User;

test('can create web3 user', function () {
    $user = Web3User::factory()->create();

    expect($user)->toBeInstanceOf(Web3User::class);
    expect($user->wallet_address)->not->toBeNull();
});

test('can use test helper methods', function () {
    $user = $this->createSufficientBalanceUser();

    expect($user->is_authenticated)->toBe(true);
    expect($user->token_balance)->toBeGreaterThanOrEqual(100000);
});

test('can mock solana service', function () {
    $this->mockSolanaService();

    $solana = app('solana');

    expect($solana->getTokenInfo())->toHaveKey('name');
    expect($solana->isValidWalletAddress('7rQ1Mn6mF2VQqSqCe88j1Zp12JhZqYzVPu3KzNm4E1tC'))->toBe(true);
    expect($solana->isValidWalletAddress('invalid'))->toBe(false);
});

test('api route works without csrf', function () {
    $this->mockSolanaService();

    // Test API route (naturally bypasses CSRF)
    $response = $this->post('/web3/can-authenticate', [
        'wallet_address' => '7rQ1Mn6mF2VQqSqCe88j1Zp12JhZqYzVPu3KzNm4E1tC',
    ]);

    // This should not be 419
    expect($response->status())->not->toBe(419);
});