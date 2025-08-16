import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

// Import wallet adapter CSS
import type { Web3ContextType } from '@/types/web3';
import '@solana/wallet-adapter-react-ui/styles.css';

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

interface Web3ProviderProps {
    children: React.ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
    // Set up Solana network (default to devnet for development)
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    const [error, setError] = useState<string | null>(null);

    // Initialize wallet adapters
    const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const contextValue: Web3ContextType = {
        network: network.toString(),
        endpoint,
        isInitialized: true,
        error,
        clearError,
    };

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <Web3Context.Provider value={contextValue}>{children}</Web3Context.Provider>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}

export function useWeb3Context() {
    const context = useContext(Web3Context);
    if (context === undefined) {
        throw new Error('useWeb3Context must be used within a Web3Provider');
    }
    return context;
}
