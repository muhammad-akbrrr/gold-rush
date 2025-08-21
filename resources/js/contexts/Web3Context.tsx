import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import React, { useMemo } from 'react';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface Web3ProviderProps {
    children: React.ReactNode;
}

/**
 * Simplified Web3 Provider - only handles Solana wallet adapter setup
 * Authentication state is now managed server-side via Inertia
 */
export function Web3Provider({ children }: Web3ProviderProps) {
    // Determine network based on environment
    const network = useMemo(() => {
        // Check for explicit environment variable or URL parameters
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const networkParam = urlParams.get('network');
            
            if (networkParam) {
                switch (networkParam.toLowerCase()) {
                    case 'mainnet':
                    case 'mainnet-beta':
                        return WalletAdapterNetwork.Mainnet;
                    case 'testnet':
                        return WalletAdapterNetwork.Testnet;
                    case 'devnet':
                        return WalletAdapterNetwork.Devnet;
                }
            }
        }
        
        // Default to devnet for development, mainnet for production
        const isDevelopment = import.meta.env?.DEV || 
                            (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') ||
                            (typeof window !== 'undefined' && window.location.hostname === 'localhost');
        
        return isDevelopment ? WalletAdapterNetwork.Devnet : WalletAdapterNetwork.Mainnet;
    }, []);

    // Set up endpoint
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    // Initialize wallet adapters
    const wallets = useMemo(() => [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
    ], []);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
