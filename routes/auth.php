<?php

use App\Http\Controllers\Auth\Web3AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web3 Authentication Routes
|--------------------------------------------------------------------------
|
| Here is where you can register Web3 authentication routes for your
| application. These routes are loaded by the RouteServiceProvider.
|
*/

// Web3 Authentication Routes
Route::middleware('guest')->group(function () {
  // Login page
  Route::get('/web3/login', [Web3AuthenticatedSessionController::class, 'create'])
    ->name('web3.login');

  // Login action
  Route::post('/web3/login', [Web3AuthenticatedSessionController::class, 'store'])
    ->name('web3.login.store');

  // Check if wallet can authenticate (without actually authenticating)
  Route::post('/web3/can-authenticate', [Web3AuthenticatedSessionController::class, 'canAuthenticate'])
    ->name('web3.can-authenticate');
});

// Protected Web3 Routes
Route::middleware('web3.auth')->group(function () {
  // Logout
  Route::post('/web3/logout', [Web3AuthenticatedSessionController::class, 'destroy'])
    ->name('web3.logout');

  // Check authentication status
  Route::get('/web3/check', [Web3AuthenticatedSessionController::class, 'check'])
    ->name('web3.check');

  // Refresh token balance
  Route::post('/web3/refresh', [Web3AuthenticatedSessionController::class, 'refresh'])
    ->name('web3.refresh');

  // Get current user info
  Route::get('/web3/me', [Web3AuthenticatedSessionController::class, 'me'])
    ->name('web3.me');
});

// Public API Routes (no authentication required)
Route::prefix('/api/web3')->group(function () {
  // Get token information
  Route::get('/token-info', function () {
    return response()->json([
      'success' => true,
      'data' => app('solana')->getTokenInfo(),
    ]);
  })->name('api.web3.token-info');

  // Get network status
  Route::get('/network-status', function () {
    return response()->json([
      'success' => true,
      'data' => app('solana')->getNetworkStatus(),
    ]);
  })->name('api.web3.network-status');

  // Validate wallet address
  Route::post('/validate-wallet', function (Illuminate\Http\Request $request) {
    $request->validate([
      'wallet_address' => 'required|string',
    ]);

    $validationService = app('web3.validation');
    $result = $validationService->validateAddressWithDetails($request->wallet_address);

    return response()->json([
      'success' => true,
      'data' => $result,
    ]);
  })->name('api.web3.validate-wallet');
});

// Protected API Routes (authentication required)
Route::prefix('/api/web3')->middleware('web3.auth')->group(function () {
  // Get user balance statistics
  Route::get('/balance-stats', function () {
    $balanceService = app('web3.balance');
    $stats = $balanceService->getBalanceStatistics();

    return response()->json([
      'success' => true,
      'data' => $stats,
    ]);
  })->name('api.web3.balance-stats');

  // Force refresh user balance
  Route::post('/refresh-balance', function (Illuminate\Http\Request $request) {
    $user = $request->get('web3_user');
    $balanceService = app('web3.balance');

    $success = $balanceService->forceRefreshBalance($user);

    return response()->json([
      'success' => $success,
      'data' => [
        'balance' => $user->token_balance,
        'is_authenticated' => $user->is_authenticated,
        'last_balance_check' => $user->last_balance_check,
      ],
    ]);
  })->name('api.web3.refresh-balance');
});