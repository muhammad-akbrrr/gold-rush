<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\Web3AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConnectWalletController;
use App\Http\Controllers\Web3ApiController;

// ============================================
// INERTIA-BASED ROUTES (PRIMARY ARCHITECTURE)
// ============================================

// Inertia Guest Routes - Wallet Connection
Route::middleware(['web', 'web3.guest'])->group(function () {
  Route::get('/connect-wallet', [Web3AuthenticatedSessionController::class, 'createInertia'])->name('web3.login.inertia');
  Route::post('/connect-wallet', [Web3AuthenticatedSessionController::class, 'storeInertia'])->name('web3.login.store.inertia');
  
});

// Inertia Authenticated Routes
Route::middleware(['web', 'web3.auth'])->group(function () {
  Route::post('/wallet/logout', [Web3AuthenticatedSessionController::class, 'destroyInertia'])->name('web3.logout.inertia');
  Route::post('/wallet/refresh', [Web3AuthenticatedSessionController::class, 'refreshInertia'])->name('web3.refresh.inertia');
});

// ============================================
// API-BASED ROUTES (LEGACY/COMPATIBILITY)
// ============================================

// Connect Wallet Routes - consolidated login endpoint
Route::middleware('web3.guest')->group(function () {
  Route::get('/web3/login', [ConnectWalletController::class, 'create'])->name('web3.login');
  Route::post('/web3/login', [ConnectWalletController::class, 'store'])->name('web3.login.store');
  Route::post('/web3/login/can-authenticate', [ConnectWalletController::class, 'canAuthenticate'])->name('web3.login.can-authenticate');
  
});

// Protected Web3 Routes (API)
Route::middleware('web3.auth')->group(function () {
  Route::post('/web3/logout', [Web3AuthenticatedSessionController::class, 'destroy'])->name('web3.logout');
  Route::get('/web3/check', [Web3AuthenticatedSessionController::class, 'check'])->name('web3.check');
  Route::post('/web3/refresh', [Web3AuthenticatedSessionController::class, 'refresh'])->name('web3.refresh');
  Route::get('/web3/me', [Web3AuthenticatedSessionController::class, 'me'])->name('web3.me');

  // Protected Web3 API Routes (authentication required)
  Route::get('/web3/balance-stats', [Web3ApiController::class, 'getBalanceStats'])->name('web3.balance-stats');
  Route::post('/web3/refresh-balance', [Web3ApiController::class, 'refreshBalance'])->name('web3.refresh-balance');
});

