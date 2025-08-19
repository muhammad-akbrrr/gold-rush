<?php

namespace App\Http\Middleware;

use App\Services\Web3AuthService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class Web3AuthMiddleware
{
  protected Web3AuthService $authService;

  public function __construct(Web3AuthService $authService)
  {
    $this->authService = $authService;
  }

  /**
   * Handle an incoming request.
   *
   * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
   */
  public function handle(Request $request, Closure $next): Response
  {
    // Get current user
    $user = $this->authService->getCurrentUser();

    // If no user is authenticated, redirect to connect-wallet
    if (!$user) {
      if ($request->expectsJson()) {
        return response()->json([
          'error' => 'Authentication required',
          'message' => 'Please connect your wallet to continue',
        ], 401);
      }

      return redirect()->route('web3.login.inertia');
    }

    // Check if user has sufficient balance
    if (!$user->hasSufficientBalance()) {
      // Log the user out if balance is insufficient
      $this->authService->logout();

      if ($request->expectsJson()) {
        return response()->json([
          'error' => 'Insufficient token balance',
          'message' => config('web3.messages.insufficient_balance'),
          'required_balance' => config('web3.min_token_balance'),
          'current_balance' => $user->token_balance,
        ], 403);
      }

      return redirect()->route('web3.login.inertia')->withErrors([
        'wallet_address' => config('web3.messages.insufficient_balance'),
      ]);
    }

    // Check if balance is stale and needs refresh
    $cacheDuration = config('web3.balance_check.cache_duration', 30);
    $staleThreshold = now()->subSeconds($cacheDuration);

    if (!$user->last_balance_check || $user->last_balance_check->lt($staleThreshold)) {
      // Refresh balance in background (don't block the request)
      try {
        $this->authService->refreshAuthentication($user);
      } catch (\Exception $e) {
        // Log error but don't fail the request
        Log::warning('Failed to refresh balance in middleware', [
          'wallet_address' => $user->wallet_address,
          'error' => $e->getMessage(),
        ]);
      }
    }

    // Add user info to request for easy access
    $request->merge(['web3_user' => $user]);

    return $next($request);
  }
}