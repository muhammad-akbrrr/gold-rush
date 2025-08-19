import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useCallback, useEffect, useState } from 'react';

export interface SimpleWalletState {
    isConnected: boolean;
    isConnecting: boolean;
    walletAddress: string | null;
    walletType: string | null;
    error: string | null;
}

export interface SimpleWalletActions {
    connectWallet: (walletName?: string) => Promise<void>;
    disconnect: () => Promise<void>;
    signMessage: (message: string) => Promise<string | null>;
    clearError: () => void;
}

export type UseSimpleWallet = SimpleWalletState & SimpleWalletActions;

/**
 * Simplified wallet connection hook - only handles browser wallet APIs
 * All authentication logic moved to backend via Inertia forms
 */
export function useSimpleWallet(): UseSimpleWallet {
    const wallet = useWallet();
    const { setVisible } = useWalletModal();
    
    const [state, setState] = useState<SimpleWalletState>({
        isConnected: false,
        isConnecting: false,
        walletAddress: null,
        walletType: null,
        error: null,
    });

    // Update state when wallet changes
    useEffect(() => {
        let walletType: string | null = null;

        if (wallet.wallet) {
            const walletName = wallet.wallet.adapter.name.toLowerCase();
            if (walletName.includes('phantom')) {
                walletType = 'phantom';
            } else if (walletName.includes('solflare')) {
                walletType = 'solflare';
            }
        }

        const walletAddress = wallet.publicKey?.toString() || null;

        setState(prev => ({
            ...prev,
            isConnected: wallet.connected,
            walletAddress,
            walletType,
            error: wallet.connected ? null : prev.error, // Clear error on successful connection
        }));
    }, [wallet.connected, wallet.publicKey, wallet.wallet]);

    // Connect to wallet
    const connectWallet = useCallback(async (walletName?: string) => {
        try {
            setState(prev => ({ ...prev, isConnecting: true, error: null }));

            if (walletName) {
                // Connect to specific wallet
                const availableWallets = wallet.wallets || [];
                const targetWallet = availableWallets.find((w) =>
                    w.adapter.name.toLowerCase().includes(walletName.toLowerCase())
                );

                if (!targetWallet) {
                    throw new Error(`${walletName} wallet not found`);
                }

                await wallet.select(targetWallet.adapter.name);
                await wallet.connect();
            } else {
                // Open wallet modal if no specific wallet provided
                if (!wallet.wallet) {
                    setVisible(true);
                    return;
                }
                await wallet.connect();
            }
        } catch (error) {
            let errorMessage = 'Failed to connect wallet';
            
            if (error instanceof Error) {
                if (error.message.includes('User rejected') || error.message.includes('User denied')) {
                    errorMessage = 'Connection was cancelled';
                } else if (error.message.includes('not found')) {
                    errorMessage = `${walletName || 'Wallet'} not found or not installed`;
                } else {
                    errorMessage = error.message;
                }
            }

            setState(prev => ({ ...prev, error: errorMessage }));
        } finally {
            setState(prev => ({ ...prev, isConnecting: false }));
        }
    }, [wallet, setVisible]);

    // Disconnect wallet
    const disconnect = useCallback(async () => {
        try {
            await wallet.disconnect();
            setState(prev => ({ 
                ...prev, 
                isConnected: false,
                walletAddress: null,
                walletType: null,
                error: null 
            }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to disconnect wallet',
            }));
        }
    }, [wallet]);

    // Sign message with connected wallet
    const signMessage = useCallback(async (message: string): Promise<string | null> => {
        try {
            if (!state.isConnected || !wallet.publicKey || !wallet.signMessage) {
                throw new Error('Wallet not connected or does not support message signing');
            }

            // Encode message for signing
            const messageBytes = new TextEncoder().encode(message);
            
            // Sign message with wallet
            const signature = await wallet.signMessage(messageBytes);
            
            // Convert signature to base58 string
            const bs58 = await import('bs58');
            return bs58.default.encode(signature);
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
            
            setState(prev => ({ ...prev, error: errorMessage }));
            return null;
        }
    }, [state.isConnected, wallet]);

    // Clear error
    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);

    return {
        ...state,
        connectWallet,
        disconnect,
        signMessage,
        clearError,
    };
}