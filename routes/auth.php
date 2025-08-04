<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\Web3AuthenticatedSessionController;
use App\Http\Controllers\Web3ApiController;

// Web3 Authentication Routes
Route::middleware('guest')->group(function () {
  Route::get('/web3/login', [Web3AuthenticatedSessionController::class, 'create'])->name('web3.login');
  Route::post('/web3/login', [Web3AuthenticatedSessionController::class, 'store'])->name('web3.login.store');
});

// Protected Web3 Routes
Route::middleware('web3.auth')->group(function () {
  Route::post('/web3/logout', [Web3AuthenticatedSessionController::class, 'destroy'])->name('web3.logout');
  Route::get('/web3/check', [Web3AuthenticatedSessionController::class, 'check'])->name('web3.check');
  Route::post('/web3/refresh', [Web3AuthenticatedSessionController::class, 'refresh'])->name('web3.refresh');
  Route::get('/web3/me', [Web3AuthenticatedSessionController::class, 'me'])->name('web3.me');

  // Protected Web3 API Routes (authentication required)
  Route::get('/web3/balance-stats', [Web3ApiController::class, 'getBalanceStats'])->name('web3.balance-stats');
  Route::post('/web3/refresh-balance', [Web3ApiController::class, 'refreshBalance'])->name('web3.refresh-balance');
});

