import type { BalanceState } from '@/types/web3';
import { useCallback, useEffect, useState } from 'react';

interface UseTokenBalanceProps {
    walletAddress: string | null;
    isConnected: boolean;
}

export function useTokenBalance({ walletAddress, isConnected }: UseTokenBalanceProps) {
    const [state, setState] = useState<BalanceState>({
        balance: null,
        isLoading: false,
        error: null,
        lastUpdated: null,
        hasSufficientBalance: false,
        minRequiredBalance: 100000, // Will be updated from backend
        minRequiredBalanceFormatted: '0.00', // Will be updated from backend
        tokenSymbol: 'GOLD', // Will be updated from backend
        tokenMintAddress: '', // Will be updated from backend
        tokenDecimals: 9, // Will be updated from backend
    });

    // Fetch token info (minimum balance, symbol, mint address) from backend
    const fetchTokenInfo = useCallback(async (): Promise<void> => {
        try {
            const response = await fetch('/web3/token-info', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Failed to fetch token info');
            }

            const { mint_address, min_balance, decimals } = result.data;

            setState((prev) => {
                const newState = {
                    ...prev,
                    minRequiredBalance: min_balance.raw,
                    minRequiredBalanceFormatted: min_balance.formatted,
                    tokenMintAddress: mint_address,
                    tokenDecimals: decimals,
                };

                return newState;
            });
        } catch (error) {
            console.error('Failed to fetch token info:', error);
        }
    }, []);

    // Fetch token balance from backend
    const fetchBalance = useCallback(async (): Promise<number | null> => {
        if (!walletAddress) return null;

        try {
            setState((prev) => ({ ...prev, isLoading: true, error: null }));

            const response = await fetch('/web3/wallet-balance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    wallet_address: walletAddress,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Failed to fetch balance');
            }

            const { balance, has_sufficient_balance, min_required_balance, token_symbol, token_mint_address, token_decimals } = result.data;

            setState((prev) => ({
                ...prev,
                balance: balance,
                isLoading: false,
                lastUpdated: new Date(),
                hasSufficientBalance: has_sufficient_balance,
                minRequiredBalance: min_required_balance.raw,
                minRequiredBalanceFormatted: min_required_balance.formatted,
                tokenSymbol: token_symbol,
                tokenMintAddress: token_mint_address,
                tokenDecimals: token_decimals,
            }));

            return balance;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch balance';
            setState((prev) => ({
                ...prev,
                error: errorMessage,
                isLoading: false,
            }));
            return null;
        }
    }, [walletAddress]);

    // Refresh balance
    const refreshBalance = useCallback(async (): Promise<void> => {
        if (!walletAddress) return;
        await fetchBalance();
    }, [walletAddress, fetchBalance]);

    // Check if balance is sufficient
    const checkSufficientBalance = useCallback(
        (balance: number): boolean => {
            return balance >= state.minRequiredBalance;
        },
        [state.minRequiredBalance],
    );

    // Format balance for display
    const formatBalance = useCallback(
        (balance: number | null): string => {
            if (balance === null) return '0';

            // Convert from smallest unit to display unit using the correct decimals
            const displayBalance = balance / Math.pow(10, state.tokenDecimals);
            const formatted = displayBalance.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            });

            return formatted;
        },
        [state.tokenDecimals],
    );

    // Clear error
    const clearError = useCallback(() => {
        setState((prev) => ({ ...prev, error: null }));
    }, []);

    // Fetch token info on component mount
    useEffect(() => {
        fetchTokenInfo();
    }, [fetchTokenInfo]);

    // Auto-fetch balance when wallet connects
    useEffect(() => {
        if (isConnected && walletAddress) {
            fetchBalance();
        } else {
            setState((prev) => ({
                ...prev,
                balance: null,
                hasSufficientBalance: false,
            }));
        }
    }, [isConnected, walletAddress, fetchBalance]);

    return {
        ...state,
        fetchBalance,
        refreshBalance,
        checkSufficientBalance,
        formatBalance,
        clearError,
    };
}
