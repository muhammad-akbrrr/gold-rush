<?php

namespace App\Http\Controllers;

use App\Contracts\SolanaServiceInterface;
use App\Contracts\TokenBalanceServiceInterface;
use App\Contracts\WalletValidationServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class Web3ApiController extends Controller
{
    public function __construct(
        private SolanaServiceInterface $solanaService,
        private WalletValidationServiceInterface $validationService,
        private TokenBalanceServiceInterface $balanceService
    ) {}

    /**
     * Get token information.
     */
    public function getTokenInfo(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->solanaService->getTokenInfo(),
        ]);
    }

    /**
     * Get network status.
     */
    public function getNetworkStatus(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->solanaService->getNetworkStatus(),
        ]);
    }

    /**
     * Validate wallet address.
     */
    public function validateWallet(Request $request): JsonResponse
    {
        $request->validate([
            'wallet_address' => 'required|string',
        ]);

        $result = $this->validationService->validateAddressWithDetails($request->wallet_address);

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    /**
     * Get user balance statistics.
     */
    public function getBalanceStats(): JsonResponse
    {
        $stats = $this->balanceService->getBalanceStatistics();

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Force refresh user balance.
     */
    public function refreshBalance(Request $request): JsonResponse
    {
        $user = $request->get('web3_user');
        $success = $this->balanceService->forceRefreshBalance($user);

        return response()->json([
            'success' => $success,
            'data' => [
                'balance' => $user->token_balance,
                'is_authenticated' => $user->is_authenticated,
                'last_balance_check' => $user->last_balance_check,
            ],
        ]);
    }
}