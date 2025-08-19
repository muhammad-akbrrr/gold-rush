import { getDefaultTransport, getMultichainClient } from '@metamask/multichain-api-client';
import { getWalletStandard, registerSolanaWalletStandard } from '@metamask/solana-wallet-standard';
import { StandardConnect, StandardDisconnect } from '@wallet-standard/features';
import { useCallback, useEffect, useState } from 'react';

export interface MetaMaskWalletState {
    isConnected: boolean;
    isConnecting: boolean;
    walletAddress: string | null;
    walletType: string | null;
    error: string | null;
}

export interface MetaMaskWalletActions {
    connectWallet: (walletName?: string) => Promise<void>;
    disconnect: () => Promise<void>;
    signMessage: (message: string) => Promise<string | null>;
    clearError: () => void;
}

export type UseMetaMaskWallet = MetaMaskWalletState & MetaMaskWalletActions;

/**
 * MetaMask Solana wallet connection hook - handles MetaMask Solana wallet API
 * Follows the same architecture as useSimpleWallet for consistency
 */
export function useMetaMaskSolana(): UseMetaMaskWallet {
    const [state, setState] = useState<MetaMaskWalletState>({
        isConnected: false,
        isConnecting: false,
        walletAddress: null,
        walletType: 'metamask',
        error: null,
    });

    const [wallet, setWallet] = useState<ReturnType<typeof getWalletStandard> | null>(null);

    // Initialize MetaMask Solana wallet
    useEffect(() => {
        const initializeWallet = async () => {
            try {
                // Initialize the multichain client
                const multichainClient = getMultichainClient({
                    transport: getDefaultTransport(),
                });

                // Register the Solana wallet standard
                await registerSolanaWalletStandard({
                    client: multichainClient,
                    walletName: 'MetaMask Solana',
                });

                // Get the wallet instance
                const walletInstance = getWalletStandard({
                    client: multichainClient,
                });
                setWallet(walletInstance);

                // Check if already connected
                if (walletInstance.accounts.length > 0) {
                    const account = walletInstance.accounts[0];
                    setState((prev) => ({
                        ...prev,
                        isConnected: true,
                        walletAddress: account.address,
                    }));
                }

                // Note: The wallet standard doesn't support event listeners in the same way
                // Account changes will be handled through reconnection
            } catch (error) {
                console.error('Failed to initialize MetaMask Solana wallet:', error);
                setState((prev) => ({
                    ...prev,
                    error: 'Failed to initialize MetaMask Solana wallet. Please ensure MetaMask is installed and supports Solana.',
                }));
            }
        };

        initializeWallet();
    }, []);

    // Connect to MetaMask Solana
    const connectWallet = useCallback(
        async () => {
            if (!wallet) {
                setState((prev) => ({
                    ...prev,
                    error: 'MetaMask Solana wallet not initialized. Please ensure MetaMask is installed and supports Solana.',
                }));
                return;
            }

            try {
                setState((prev) => ({ ...prev, isConnecting: true, error: null }));

                // Connect to the wallet using the StandardConnect feature
                const connectFeature = wallet.features[StandardConnect];
                if (!connectFeature?.connect) {
                    throw new Error('Connect feature not available');
                }

                await connectFeature.connect();

                // Check if connection was successful
                if (wallet.accounts.length > 0) {
                    const account = wallet.accounts[0];
                    setState((prev) => ({
                        ...prev,
                        isConnected: true,
                        walletAddress: account.address,
                        isConnecting: false,
                    }));
                } else {
                    setState((prev) => ({
                        ...prev,
                        isConnecting: false,
                        error: 'Failed to connect to MetaMask Solana wallet. Please try again.',
                    }));
                }
            } catch (error: unknown) {
                let errorMessage = 'Failed to connect to MetaMask Solana wallet';

                if (error && typeof error === 'object' && 'message' in error) {
                    const metaMaskError = error as { message?: string };
                    if (metaMaskError.message) {
                        errorMessage = metaMaskError.message;
                    }
                }

                setState((prev) => ({
                    ...prev,
                    isConnecting: false,
                    error: errorMessage,
                }));
            }
        },
        [wallet],
    );

    // Disconnect from MetaMask Solana
    const disconnect = useCallback(async () => {
        if (!wallet) return;

        try {
            // Disconnect using the StandardDisconnect feature
            const disconnectFeature = wallet.features[StandardDisconnect];
            if (!disconnectFeature?.disconnect) {
                throw new Error('Disconnect feature not available');
            }

            await disconnectFeature.disconnect();

            setState((prev) => ({
                ...prev,
                isConnected: false,
                walletAddress: null,
                error: null,
            }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to disconnect MetaMask Solana wallet';
            setState((prev) => ({
                ...prev,
                error: errorMessage,
            }));
        }
    }, [wallet]);

    // Sign message with MetaMask Solana wallet
    const signMessage = useCallback(
        async (message: string): Promise<string | null> => {
            try {
                if (!state.isConnected || !wallet || wallet.accounts.length === 0) {
                    throw new Error('Wallet not connected');
                }

                // Note: MetaMask Solana signing implementation would go here
                // This is a placeholder - actual implementation depends on MetaMask's Solana signing API
                // The message parameter will be used when implementing actual signing
                console.log('Message to sign:', message);
                throw new Error('Message signing not yet implemented for MetaMask Solana');
            } catch (error) {
                let errorMessage = 'Failed to sign message';

                if (error instanceof Error) {
                    if (error.message.includes('User rejected') || error.message.includes('User denied')) {
                        errorMessage = 'Signature request was rejected by user';
                    } else if (error.message.includes('not connected')) {
                        errorMessage = 'Wallet not connected';
                    } else {
                        errorMessage = error.message;
                    }
                }

                setState((prev) => ({ ...prev, error: errorMessage }));
                return null;
            }
        },
        [state.isConnected, wallet],
    );

    // Clear error
    const clearError = useCallback(() => {
        setState((prev) => ({ ...prev, error: null }));
    }, []);

    return {
        ...state,
        connectWallet,
        disconnect,
        signMessage,
        clearError,
    };
}
