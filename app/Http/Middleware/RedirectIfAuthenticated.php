<?php

namespace App\Http\Middleware;

use App\Services\Web3AuthService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticated
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

    // If user is authenticated, redirect to dashboard
    if ($user && $user->hasSufficientBalance()) {
      if ($request->expectsJson()) {
        return response()->json([
          'error' => 'Already authenticated',
          'message' => 'You are already logged in',
          'redirect' => '/dashboard',
        ], 200);
      }

      return redirect()->route('dashboard');
    }

    return $next($request);
  }
}