// Simplified Web3 Types for Inertia-based Architecture

// Wallet Types
export type WalletType = 'phantom' | 'solflare' | 'metamask';

// Wallet Connection Types (for browser wallet APIs only)
export interface WalletConnectionState {
    isConnected: boolean;
    isConnecting: boolean;
    walletAddress: string | null;
    walletType: WalletType | null;
    error: string | null;
}

// Server-side types (received via Inertia shared data)
export interface Web3AuthData {
    isAuthenticated: boolean;
    user: {
        id: number;
        walletAddress: string;
        displayName?: string;
        tokenBalance: number;
        isAuthenticated: boolean;
        lastBalanceCheck?: string;
    } | null;
    hasSufficientBalance: boolean;
    balanceFormatted: string | null;
}

// Challenge authentication (still needs client-side signature)
export interface Challenge {
    message: string;
    nonce: string;
    timestamp: number;
    expires_at: number;
}
