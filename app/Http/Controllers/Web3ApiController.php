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
    ) {
    }

    /**
     * Get token information.
     */
    public function getTokenInfo(): JsonResponse
    {
        $tokenInfo = $this->solanaService->getTokenInfo();

        // Calculate formatted values for display
        $minBalanceRaw = $tokenInfo['min_balance'];
        $minBalanceFormatted = number_format($minBalanceRaw / pow(10, $tokenInfo['decimals']), 2);

        return response()->json([
            'success' => true,
            'data' => [
                'mint_address' => $tokenInfo['mint_address'],
                'min_balance' => [
                    'raw' => $minBalanceRaw,
                    'formatted' => $minBalanceFormatted,
                ],
                'decimals' => $tokenInfo['decimals'],
                'network' => $tokenInfo['network'],
            ],
        ]);
    }

    /**
     * Get wallet balance for a specific address.
     */
    public function getWalletBalance(Request $request): JsonResponse
    {
        $request->validate([
            'wallet_address' => 'required|string',
        ]);

        $walletAddress = $request->wallet_address;

        // Validate wallet address format
        if (!$this->solanaService->isValidWalletAddress($walletAddress)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid wallet address format',
            ], 400);
        }

        try {
            $balance = $this->solanaService->getTokenBalance($walletAddress);
            $tokenInfo = $this->solanaService->getTokenInfo();
            $hasSufficientBalance = $balance !== null && $balance >= $tokenInfo['min_balance'];

            // Calculate formatted values for display
            $minBalanceRaw = $tokenInfo['min_balance'];
            $minBalanceFormatted = number_format($minBalanceRaw / pow(10, $tokenInfo['decimals']), 2);

            // Format the user's balance for display
            $balanceFormatted = $balance !== null ? number_format($balance / pow(10, $tokenInfo['decimals']), 2) : '0.00';

            return response()->json([
                'success' => true,
                'data' => [
                    'wallet_address' => $walletAddress,
                    'balance' => [
                        'raw' => $balance,
                        'formatted' => $balanceFormatted,
                    ],
                    'has_sufficient_balance' => $hasSufficientBalance,
                    'min_required_balance' => [
                        'raw' => $minBalanceRaw,
                        'formatted' => $minBalanceFormatted,
                    ],
                    'token_decimals' => $tokenInfo['decimals'],
                    'token_symbol' => 'GOLD',
                    'token_mint_address' => $tokenInfo['mint_address'],
                    'network' => $tokenInfo['network'],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch wallet balance',
                'error' => $e->getMessage(),
            ], 500);
        }
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

        $result = $this->validationService->validate($request->wallet_address);

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