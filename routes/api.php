<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\Web3AuthenticatedSessionController;
use App\Http\Controllers\Web3ApiController;

// Public Web3 API Routes (no authentication required)
Route::prefix('web3')->group(function () {
    Route::get('/token-info', [Web3ApiController::class, 'getTokenInfo'])->name('api.web3.token-info');
    Route::get('/network-status', [Web3ApiController::class, 'getNetworkStatus'])->name('api.web3.network-status');
    Route::post('/validate-wallet', [Web3ApiController::class, 'validateWallet'])->name('api.web3.validate-wallet');
    Route::post('/can-authenticate', [Web3AuthenticatedSessionController::class, 'canAuthenticate'])->name('api.web3.can-authenticate');
});

// Protected Web3 API Routes (authentication required)
Route::prefix('web3')->middleware('web3.auth')->group(function () {
    Route::get('/balance-stats', [Web3ApiController::class, 'getBalanceStats'])->name('api.web3.balance-stats');
    Route::post('/refresh-balance', [Web3ApiController::class, 'refreshBalance'])->name('api.web3.refresh-balance');
    Route::post('/logout', [Web3AuthenticatedSessionController::class, 'destroy'])->name('api.web3.logout');
});