<?php

use App\Models\Web3User;

test('unauthenticated users are redirected to connect wallet', function () {
    $this->get('/dashboard')->assertRedirect(route('web3.login'));
});

test('authenticated web3 users can visit the dashboard', function () {
    $this->actingAsWeb3User();

    $this->get('/dashboard')->assertOk();
});