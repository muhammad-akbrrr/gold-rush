<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\Web3AuthenticatedSessionController;
use App\Http\Controllers\Web3ApiController;

// Web3 Authentication Routes
Route::middleware('guest')->group(function () {
  Route::get('/web3/login', [Web3AuthenticatedSessionController::class, 'create'])->name('web3.login');
  Route::post('/web3/login', [Web3AuthenticatedSessionController::class, 'store'])->name('web3.login.store');
  Route::post('/web3/can-authenticate', [Web3AuthenticatedSessionController::class, 'canAuthenticate'])->name('web3.can-authenticate');
});

// Protected Web3 Routes
Route::middleware('web3.auth')->group(function () {
  Route::post('/web3/logout', [Web3AuthenticatedSessionController::class, 'destroy'])->name('web3.logout');
  Route::get('/web3/check', [Web3AuthenticatedSessionController::class, 'check'])->name('web3.check');
  Route::post('/web3/refresh', [Web3AuthenticatedSessionController::class, 'refresh'])->name('web3.refresh');
  Route::get('/web3/me', [Web3AuthenticatedSessionController::class, 'me'])->name('web3.me');
});

// Protected API Routes (authentication required)
Route::prefix('/api/web3')->middleware('web3.auth')->group(function () {
  Route::get('/balance-stats', [Web3ApiController::class, 'getBalanceStats'])->name('api.web3.balance-stats');
  Route::post('/refresh-balance', [Web3ApiController::class, 'refreshBalance'])->name('api.web3.refresh-balance');
});

// Public API Routes
Route::prefix('/api/web3')->group(function () {
  Route::get('/token-info', [Web3ApiController::class, 'getTokenInfo'])->name('api.web3.token-info');
  Route::get('/network-status', [Web3ApiController::class, 'getNetworkStatus'])->name('api.web3.network-status');
  Route::post('/validate-wallet', [Web3ApiController::class, 'validateWallet'])->name('api.web3.validate-wallet');
});