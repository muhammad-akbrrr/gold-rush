// Web3 Context Types
export interface Web3ContextType {
    network: string;
    endpoint: string;
    isInitialized: boolean;
    error: string | null;
    clearError: () => void;
}

// Wallet Types
export type WalletType = 'phantom' | 'solflare' | 'metamask';

export interface WalletInfo {
    type: WalletType;
    name: string;
    icon: string;
    downloadUrl: string;
    isInstalled: boolean;
}

// Wallet Connection Types
export interface WalletConnectionState {
    isConnected: boolean;
    isConnecting: boolean;
    isDisconnecting: boolean;
    walletAddress: string | null;
    walletType: WalletType | null;
    error: string | null;
}

// Authentication Types
export interface AuthState {
    isAuthenticating: boolean;
    isAuthenticated: boolean;
    user: Web3User | null;
    error: string | null;
    balance: number | null;
    hasSufficientBalance: boolean;
}

export interface AuthResult {
    success: boolean;
    user?: Web3User;
    message?: string;
    errors?: Record<string, string[]>;
    data?: {
        can_authenticate?: boolean;
        balance?: number;
        has_sufficient_balance?: boolean;
        errors?: string[];
    };
}

// Balance Types
export interface BalanceState {
    balance: number | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    hasSufficientBalance: boolean;
    minRequiredBalance: number;
    minRequiredBalanceFormatted: string;
    tokenSymbol: string;
    tokenMintAddress: string;
    tokenDecimals: number;
}

// Web3 User Types
export interface Web3User {
    id: number;
    wallet_address: string;
    display_name?: string;
    avatar_url?: string;
    token_balance: number;
    last_balance_check?: string;
    is_authenticated: boolean;
    authenticated_at?: string;
    created_at: string;
    updated_at: string;
}

// Token Info Types
export interface TokenInfo {
    mint_address: string;
    min_balance: number;
    decimals: number;
    network: string;
}

// Network Status Types
export interface NetworkStatus {
    status: 'connected' | 'disconnected' | 'error';
    network: string;
    rpc_url: string;
    error?: string;
}

// Wallet Validation Types
export interface WalletValidationResult {
    is_valid: boolean;
    errors: string[];
    warnings: string[];
}

// API Response Types
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
}
