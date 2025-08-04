import type { AuthResult, AuthState } from '@/types/web3';
import { router } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import { route } from 'ziggy-js';

export function useWeb3Auth() {
    // We don't need walletAddress in this hook currently
    // const { walletAddress } = useWalletConnection();
    const [state, setState] = useState<AuthState>({
        isAuthenticating: false,
        isAuthenticated: false,
        user: null,
        error: null,
        balance: null,
        hasSufficientBalance: false,
    });

    // Check if wallet can authenticate (pre-authentication check)
    const checkCanAuthenticate = useCallback(async (address: string): Promise<AuthResult> => {
        try {
            const response = await fetch('/web3/login/can-authenticate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ wallet_address: address }),
            });

            const data = await response.json();
            return data;
        } catch {
            return {
                success: false,
                message: 'Failed to check authentication eligibility',
            };
        }
    }, []);

    // Validate wallet address
    const validateWallet = useCallback(async (address: string): Promise<AuthResult> => {
        try {
            const response = await fetch('/web3/validate-wallet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ wallet_address: address }),
            });

            const data = await response.json();
            return data;
        } catch {
            return {
                success: false,
                message: 'Failed to validate wallet address',
            };
        }
    }, []);

    // Authenticate with backend
    const authenticate = useCallback(async (address: string, signature?: string, message?: string): Promise<AuthResult> => {
        try {
            setState((prev) => ({ ...prev, isAuthenticating: true, error: null }));

            const payload: Record<string, string> = { wallet_address: address };
            if (signature && message) {
                payload.signature = signature;
                payload.message = message;
            }

            const response = await fetch('/web3/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                setState((prev) => ({
                    ...prev,
                    isAuthenticated: true,
                    user: data.user,
                    balance: data.user?.token_balance || null,
                    hasSufficientBalance: data.user?.is_authenticated || false,
                }));

                // Redirect to dashboard on successful authentication
                router.visit('/dashboard');
            } else {
                setState((prev) => ({
                    ...prev,
                    error: 'Authentication failed. Please try again',
                }));
            }

            return data;
        } catch {
            const errorMessage = 'Authentication failed. Please try again';
            setState((prev) => ({ ...prev, error: errorMessage }));
            return { success: false, message: errorMessage };
        } finally {
            setState((prev) => ({ ...prev, isAuthenticating: false }));
        }
    }, []);

    // Sign message and authenticate
    const signAndAuthenticate = useCallback(
        async (address: string): Promise<AuthResult> => {
            try {
                // This would typically use the wallet to sign the message
                // For now, we'll authenticate without signature verification
                return await authenticate(address);
            } catch {
                return {
                    success: false,
                    message: 'Failed to sign message',
                };
            }
        },
        [authenticate],
    );

    // Logout
    const logout = useCallback(async (): Promise<void> => {
        try {
            await fetch('/web3/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            setState((prev) => ({
                ...prev,
                isAuthenticated: false,
                user: null,
                balance: null,
                hasSufficientBalance: false,
            }));

            router.visit(route('web3.login'));
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }, []);

    // Check authentication status
    const checkAuthStatus = useCallback(async (): Promise<void> => {
        try {
            const response = await fetch('/web3/check', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data.authenticated) {
                setState((prev) => ({
                    ...prev,
                    isAuthenticated: true,
                    user: data.user,
                    balance: data.user?.token_balance || null,
                    hasSufficientBalance: data.balance_sufficient || false,
                }));
            }
        } catch (error) {
            console.error('Failed to check auth status:', error);
        }
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setState((prev) => ({ ...prev, error: null }));
    }, []);

    return {
        ...state,
        checkCanAuthenticate,
        validateWallet,
        authenticate,
        signAndAuthenticate,
        logout,
        checkAuthStatus,
        clearError,
    };
}
