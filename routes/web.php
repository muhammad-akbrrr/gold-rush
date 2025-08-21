<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Web3ApiController;
use App\Http\Controllers\DashboardController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/about', function () {
    return Inertia::render('about');
});

// Public Web3 API Routes (no authentication required)
Route::prefix('web3')->group(function () {
    Route::get('/token-info', [Web3ApiController::class, 'getTokenInfo'])->name('web3.token-info');
    Route::get('/network-status', [Web3ApiController::class, 'getNetworkStatus'])->name('web3.network-status');
    Route::post('/validate-wallet', [Web3ApiController::class, 'validateWallet'])->name('web3.validate-wallet');
    Route::post('/wallet-balance', [Web3ApiController::class, 'getWalletBalance'])->name('web3.wallet-balance');
});

Route::middleware('web3.auth')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
