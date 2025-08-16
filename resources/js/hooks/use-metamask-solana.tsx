import type { WalletConnectionState } from '@/types/web3';
import { getDefaultTransport, getMultichainClient } from '@metamask/multichain-api-client';
import { getWalletStandard, registerSolanaWalletStandard } from '@metamask/solana-wallet-standard';
import { StandardConnect, StandardDisconnect } from '@wallet-standard/features';
import { useCallback, useEffect, useState } from 'react';

export function useMetaMaskSolana() {
    const [state, setState] = useState<WalletConnectionState>({
        isConnected: false,
        isConnecting: false,
        isDisconnecting: false,
        walletAddress: null,
        walletType: 'metamask',
        error: null,
    });

    const [wallet, setWallet] = useState<ReturnType<typeof getWalletStandard> | null>(null);
    const [client, setClient] = useState<ReturnType<typeof getMultichainClient> | null>(null);

    // Initialize MetaMask Solana wallet
    useEffect(() => {
        const initializeWallet = async () => {
            try {
                // Initialize the multichain client
                const multichainClient = getMultichainClient({
                    transport: getDefaultTransport(),
                });
                setClient(multichainClient);

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
    const connect = useCallback(async () => {
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
    }, [wallet]);

    // Disconnect from MetaMask Solana (standard only, no forget logic)
    const disconnect = useCallback(async () => {
        if (!wallet) return;

        try {
            setState((prev) => ({ ...prev, isDisconnecting: true, error: null }));

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
                isDisconnecting: false,
            }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to disconnect MetaMask Solana wallet';
            setState((prev) => ({
                ...prev,
                isDisconnecting: false,
                error: errorMessage,
            }));
        }
    }, [wallet]);

    // Check if MetaMask Solana is supported
    const checkInstallation = useCallback(async (): Promise<boolean> => {
        try {
            // Try to initialize the client to check if MetaMask is available
            const multichainClient = getMultichainClient({
                transport: getDefaultTransport(),
            });
            return !!multichainClient;
        } catch {
            return false;
        }
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setState((prev) => ({ ...prev, error: null }));
    }, []);

    return {
        ...state,
        connect,
        disconnect,
        checkInstallation,
        clearError,
        wallet,
        client,
    };
}
