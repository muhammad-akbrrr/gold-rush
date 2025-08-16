<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\Web3LoginRequest;
use App\Services\Web3AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ConnectWalletController extends Controller
{
  protected Web3AuthService $authService;

  public function __construct(Web3AuthService $authService)
  {
    $this->authService = $authService;
  }

  /**
   * Display the connect wallet view.
   */
  public function create(): Response
  {
    try {
      return Inertia::render('auth/connect-wallet', [
        'tokenInfo' => app('solana')->getTokenInfo(),
        'networkStatus' => app('solana')->getNetworkStatus(),
      ]);
    } catch (\Exception $e) {
      // Fallback if solana service has issues
      return Inertia::render('auth/connect-wallet', [
        'tokenInfo' => null,
        'networkStatus' => null,
      ]);
    }
  }

  /**
   * Handle an incoming authentication request.
   */
  public function store(Web3LoginRequest $request): JsonResponse
  {
    try {
      $user = $this->authService->authenticate(
        $request->wallet_address,
        $request->message,
        $request->signature
      );

      if (!$user) {
        throw ValidationException::withMessages([
          'wallet_address' => config('web3.messages.authentication_failed'),
        ]);
      }

      $request->session()->regenerate();

      return response()->json([
        'success' => true,
        'user' => $user->only(['id', 'wallet_address', 'display_name', 'token_balance', 'is_authenticated']),
        'message' => 'Authentication successful',
      ]);

    } catch (ValidationException $e) {
      return response()->json([
        'success' => false,
        'errors' => $e->errors(),
        'message' => 'Authentication failed',
      ], 422);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'An error occurred during authentication',
        'error' => $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Check if a wallet can authenticate (without actually authenticating).
   */
  public function canAuthenticate(Request $request): JsonResponse
  {
    $request->validate([
      'wallet_address' => 'required|string',
    ]);

    $result = $this->authService->canAuthenticate($request->wallet_address);

    return response()->json([
      'success' => true,
      'data' => $result,
    ]);
  }
}