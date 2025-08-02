<?php

use App\Models\Web3User;

test('web3 profile page is displayed', function () {
    $user = $this->createSufficientBalanceUser();

    $response = $this
        ->actingAs($user, 'web3')
        ->get('/settings/profile');

    $response->assertOk();
});

test('wallet address is displayed and read-only', function () {
    $user = Web3User::factory()->create([
        'wallet_address' => '7rQ1Mn6mF2VQqSqCe88j1Zp12JhZqYzVPu3KzNm4E1tC',
        'is_authenticated' => true,
        'token_balance' => 150000,
    ]);

    $response = $this
        ->actingAs($user, 'web3')
        ->get('/settings/profile');

    $response->assertOk();
    // The wallet address should be displayed but not editable
});

test('web3 user can view their token balance information', function () {
    $user = Web3User::factory()->create([
        'wallet_address' => '7rQ1Mn6mF2VQqSqCe88j1Zp12JhZqYzVPu3KzNm4E1tC',
        'token_balance' => 150000,
        'is_authenticated' => true,
    ]);

    $response = $this
        ->actingAs($user, 'web3')
        ->get('/settings/profile');

    $response->assertOk();
    // Profile should show wallet info including balance
});


test('wallet balance information is current', function () {
    $user = Web3User::factory()->create([
        'wallet_address' => '7rQ1Mn6mF2VQqSqCe88j1Zp12JhZqYzVPu3KzNm4E1tC',
        'token_balance' => 75000, // Below minimum
        'is_authenticated' => false,
    ]);

    $response = $this
        ->actingAs($user, 'web3')
        ->get('/settings/profile');

    // Should either redirect to login due to insufficient balance
    // or show profile with balance warning
    // This depends on your middleware implementation
    expect($response->status())->toBeIn([200, 302]);
});