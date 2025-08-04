import type { WalletConnectionState, WalletType } from '@/types/web3';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useCallback, useEffect, useState } from 'react';

export function useWalletConnection() {
    const wallet = useWallet();
    const { setVisible } = useWalletModal();
    const [state, setState] = useState<WalletConnectionState>({
        isConnected: false,
        isConnecting: false,
        isDisconnecting: false,
        walletAddress: null,
        walletType: null,
        error: null,
    });

    // Update state when wallet changes
    useEffect(() => {
        let walletType: WalletType | null = null;

        if (wallet.wallet) {
            const walletName = wallet.wallet.adapter.name.toLowerCase();
            if (walletName.includes('phantom')) {
                walletType = 'phantom';
            } else if (walletName.includes('solflare')) {
                walletType = 'solflare';
            }
        }

        setState((prev) => ({
            ...prev,
            isConnected: wallet.connected,
            walletAddress: wallet.publicKey?.toString() || null,
            walletType,
            error: null,
        }));
    }, [wallet.connected, wallet.publicKey, wallet.wallet]);

    // Connect wallet
    const connect = useCallback(async () => {
        try {
            setState((prev) => ({ ...prev, isConnecting: true, error: null }));

            if (!wallet.wallet) {
                setVisible(true);
                return;
            }

            await wallet.connect();
        } catch (error) {
            setState((prev) => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to connect wallet',
            }));
        } finally {
            setState((prev) => ({ ...prev, isConnecting: false }));
        }
    }, [wallet, setVisible]);

    // Connect to specific wallet
    const connectToWallet = useCallback(
        async (walletName: string) => {
            try {
                setState((prev) => ({ ...prev, isConnecting: true, error: null }));

                // Find the specific wallet adapter
                const availableWallets = wallet.wallets || [];
                const targetWallet = availableWallets.find((w) => w.adapter.name.toLowerCase().includes(walletName.toLowerCase()));

                if (!targetWallet) {
                    setState((prev) => ({
                        ...prev,
                        error: `${walletName} wallet not found`,
                        isConnecting: false,
                    }));
                    return;
                }

                // Select and connect to the specific wallet
                await wallet.select(targetWallet.adapter.name);
                await wallet.connect();
            } catch (error) {
                setState((prev) => ({
                    ...prev,
                    error: error instanceof Error ? error.message : `Failed to connect to ${walletName}`,
                }));
            } finally {
                setState((prev) => ({ ...prev, isConnecting: false }));
            }
        },
        [wallet],
    );

    // Handle wallet connection errors
    useEffect(() => {
        if (wallet.wallet && !wallet.connected && wallet.wallet.adapter) {
            const handleError = (error: Error) => {
                setState((prev) => ({
                    ...prev,
                    error: error.message || 'Wallet connection error',
                }));
            };

            // Listen for adapter errors
            wallet.wallet.adapter.on('error', handleError);

            return () => {
                if (wallet.wallet?.adapter) {
                    wallet.wallet.adapter.off('error', handleError);
                }
            };
        }
    }, [wallet.wallet, wallet.connected]);

    // Standard disconnect wallet - no hacky attempts to force account selection
    const disconnect = useCallback(async () => {
        try {
            setState((prev) => ({ ...prev, isDisconnecting: true, error: null }));
            await wallet.disconnect();
        } catch (error) {
            setState((prev) => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to disconnect wallet',
            }));
        } finally {
            setState((prev) => ({ ...prev, isDisconnecting: false }));
        }
    }, [wallet]);

    // Open wallet modal
    const openWalletModal = useCallback(() => {
        setVisible(true);
    }, [setVisible]);

    // Clear error
    const clearError = useCallback(() => {
        setState((prev) => ({ ...prev, error: null }));
    }, []);

    return {
        ...state,
        connect,
        connectToWallet,
        disconnect,
        openWalletModal,
        clearError,
        wallet,
    };
}
