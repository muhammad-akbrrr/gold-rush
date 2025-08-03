<?php

use App\Models\Web3User;

test('guests are redirected to the web3 login page', function () {
    $this->get('/dashboard')->assertRedirect(route('web3.login'));
});

test('authenticated web3 users can visit the dashboard', function () {
    $this->actingAsWeb3User();

    $this->get('/dashboard')->assertOk();
});