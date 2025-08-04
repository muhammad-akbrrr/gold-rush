import type { WalletConnectionState, WalletType } from '@/types/web3';
import { useCallback, useState } from 'react';
import { useMetaMaskSolana } from './use-metamask-solana';
import { useTokenBalance } from './use-token-balance';
import { useWalletConnection } from './use-wallet-connection';

export function useUnifiedWallet() {
    const solanaWallet = useWalletConnection();
    const metaMaskWallet = useMetaMaskSolana();

    const [activeWalletType, setActiveWalletType] = useState<WalletType | null>(null);

    // Get the current wallet state based on active wallet type
    const getCurrentWalletState = (): WalletConnectionState => {
        if (activeWalletType === 'metamask') {
            return metaMaskWallet;
        }
        return solanaWallet;
    };

    const currentState = getCurrentWalletState();

    // Use token balance hook with current wallet state
    const tokenBalance = useTokenBalance({
        walletAddress: currentState.walletAddress,
        isConnected: currentState.isConnected,
    });

    // Connect to specific wallet
    const connectToWallet = useCallback(
        async (walletType: WalletType) => {
            setActiveWalletType(walletType);

            try {
                if (walletType === 'metamask') {
                    await metaMaskWallet.connect();
                } else {
                    // For Phantom and Solflare, use the Solana wallet adapter
                    await solanaWallet.connectToWallet(walletType === 'phantom' ? 'Phantom' : 'Solflare');
                }
            } catch (error) {
                console.error(`Failed to connect to ${walletType}:`, error);
                // Reset active wallet type on connection failure
                setActiveWalletType(null);
            }
        },
        [metaMaskWallet, solanaWallet],
    );

    // Enhanced disconnect current wallet - ensures wallet extension forgets the dApp
    const disconnect = useCallback(async () => {
        try {
            if (activeWalletType === 'metamask') {
                await metaMaskWallet.disconnect();
            } else {
                await solanaWallet.disconnect();
            }
        } catch (error) {
            console.error('Failed to disconnect wallet:', error);
        } finally {
            // Always reset the active wallet type after disconnect attempt
            setActiveWalletType(null);
        }
    }, [activeWalletType, metaMaskWallet, solanaWallet]);

    // Clear error for current wallet
    const clearError = useCallback(() => {
        if (activeWalletType === 'metamask') {
            metaMaskWallet.clearError();
        } else {
            solanaWallet.clearError();
        }
    }, [activeWalletType, metaMaskWallet, solanaWallet]);

    // Check if any wallet is connected
    const isAnyWalletConnected = solanaWallet.isConnected || metaMaskWallet.isConnected;

    // Get the connected wallet address
    const getConnectedWalletAddress = (): string | null => {
        if (solanaWallet.isConnected) return solanaWallet.walletAddress;
        if (metaMaskWallet.isConnected) return metaMaskWallet.walletAddress;
        return null;
    };

    // Get the connected wallet type
    const getConnectedWalletType = (): WalletType | null => {
        if (solanaWallet.isConnected) return solanaWallet.walletType;
        if (metaMaskWallet.isConnected) return metaMaskWallet.walletType;
        return null;
    };

    return {
        // State
        isConnected: isAnyWalletConnected,
        isConnecting: currentState.isConnecting,
        isDisconnecting: currentState.isDisconnecting,
        walletAddress: getConnectedWalletAddress(),
        walletType: getConnectedWalletType(),
        error: currentState.error,
        activeWalletType,

        // Actions
        connectToWallet,
        disconnect,
        clearError,

        // Token balance properties
        balance: tokenBalance.balance,
        balanceLoading: tokenBalance.isLoading,
        balanceError: tokenBalance.error,
        hasSufficientBalance: tokenBalance.hasSufficientBalance,
        minRequiredBalance: tokenBalance.minRequiredBalance,
        minRequiredBalanceFormatted: tokenBalance.minRequiredBalanceFormatted,
        formatBalance: tokenBalance.formatBalance,
        refreshBalance: tokenBalance.refreshBalance,
        clearBalanceError: tokenBalance.clearError,
        tokenSymbol: tokenBalance.tokenSymbol,
        tokenMintAddress: tokenBalance.tokenMintAddress,

        // Individual wallet hooks for specific functionality
        solanaWallet,
        metaMaskWallet,
    };
}
