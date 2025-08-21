import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useSimpleWallet } from '@/hooks/use-simple-wallet';
import { useMetaMaskSolana } from '@/hooks/use-metamask-solana';
import AuthLayout from '@/layouts/auth-layout';
import type { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Head, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, Loader2, RefreshCw, Wallet, XCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface TokenInfo {
    mint_address: string;
    min_balance: number;
    decimals: number;
    network: string;
}

interface NetworkStatus {
    status: 'connected' | 'disconnected' | 'error';
    network: string;
    rpc_url: string;
    error?: string;
}

interface PageProps extends InertiaPageProps {
    auth?: {
        web3?: {
            isAuthenticated: boolean;
            user?: {
                walletAddress: string;
                displayName?: string;
                tokenBalance: number;
            };
            balanceFormatted: string | null;
        };
    };
    web3Config?: {
        minTokenBalance: number;
        minTokenBalanceFormatted: string;
        supportedWallets: string[];
        network: string;
        messages: {
            insufficientBalance: string;
            authenticationFailed: string;
            invalidWallet: string;
        };
    };
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
        info?: string;
    };
    tokenInfo?: TokenInfo;
    networkStatus?: NetworkStatus;
    minTokenBalance: number;
    supportedWallets: string[];
}

export default function ConnectWallet() {
    const { auth, flash, web3Config } = usePage<PageProps>().props;
    
    // Wallet selection state
    const [selectedWallet, setSelectedWallet] = useState<'phantom' | 'solflare' | 'metamask' | null>(null);
    
    // Initialize both wallet hooks
    const simpleWallet = useSimpleWallet();
    const metaMaskWallet = useMetaMaskSolana();
    
    // Use the appropriate wallet based on selection
    const activeWallet = selectedWallet === 'metamask' ? metaMaskWallet : simpleWallet;
    const { isConnected, isConnecting, walletAddress, walletType, error: walletError } = activeWallet;

    const [isAuthenticating, setIsAuthenticating] = useState(false);

    // Balance checking state
    const [balance, setBalance] = useState<number | null>(null);
    const [hasInsufficientBalance, setHasInsufficientBalance] = useState(false);
    const [isLoadingBalance, setIsLoadingBalance] = useState(false);
    const [balanceError, setBalanceError] = useState<string | null>(null);

    // Inertia form for wallet connection
    const { setData, post, processing, errors, reset } = useForm({
        wallet_address: '',
        signature: '',
        message: '',
        wallet_type: '',
        display_name: '',
    });

    // Fetch wallet balance function
    const fetchWalletBalance = useCallback(async (address: string) => {
        if (!address) return;

        try {
            setIsLoadingBalance(true);
            setBalanceError(null);

            const response = await fetch(route('web3.login.can-authenticate'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    wallet_address: address,
                }),
            });

            const data = await response.json();

            if (data.success && data.data) {
                setBalance(data.data.balance);
                setHasInsufficientBalance(!data.data.has_sufficient_balance);
            } else {
                setBalanceError('Failed to fetch balance');
                setBalance(null);
                setHasInsufficientBalance(false);
            }
        } catch (error) {
            console.error('Error fetching wallet balance:', error);
            setBalanceError('Error fetching balance');
            setBalance(null);
            setHasInsufficientBalance(false);
        } finally {
            setIsLoadingBalance(false);
        }
    }, []);

    // Update form data when wallet connects
    useEffect(() => {
        if (isConnected && walletAddress && walletType) {
            setData((prev) => ({
                ...prev,
                wallet_address: walletAddress,
                wallet_type: walletType,
            }));
        }
    }, [isConnected, walletAddress, walletType, setData]);

    // Fetch balance when wallet connects
    useEffect(() => {
        if (isConnected && walletAddress && !auth?.web3?.isAuthenticated) {
            fetchWalletBalance(walletAddress);
        }
    }, [isConnected, walletAddress, auth?.web3?.isAuthenticated, fetchWalletBalance]);

    // Handle wallet connection
    const handleConnectWallet = useCallback(
        async (walletName: 'phantom' | 'solflare' | 'metamask') => {
            try {
                // Set the selected wallet first
                setSelectedWallet(walletName);
                
                // Clear any existing errors
                simpleWallet.clearError();
                metaMaskWallet.clearError();
                
                // Connect using the appropriate wallet hook
                if (walletName === 'metamask') {
                    await metaMaskWallet.connectWallet();
                } else {
                    await simpleWallet.connectWallet(walletName);
                }
            } catch (error) {
                console.error('Wallet connection failed:', error);
            }
        },
        [simpleWallet, metaMaskWallet],
    );

    // Handle authentication with signature
    const handleAuthenticate = useCallback(async () => {
        if (!isConnected || !walletAddress) return;

        try {
            setIsAuthenticating(true);

            // Simple balance-based authentication
            post(route('web3.login.store.inertia'), {
                onSuccess: () => {
                    console.log('Authentication successful!');
                },
                onError: (errors) => {
                    console.error('Authentication failed:', errors);
                },
            });
        } catch (error) {
            console.error('Authentication error:', error);
        } finally {
            setIsAuthenticating(false);
        }
    }, [isConnected, walletAddress, post]);

    // Handle balance refresh
    const handleRefreshBalance = useCallback(async () => {
        if (!walletAddress) return;
        await fetchWalletBalance(walletAddress);
    }, [walletAddress, fetchWalletBalance]);

    // Handle disconnect
    const handleDisconnect = useCallback(async () => {
        try {
            // Disconnect from the currently selected wallet
            if (selectedWallet === 'metamask') {
                await metaMaskWallet.disconnect();
            } else {
                await simpleWallet.disconnect();
            }
            
            // Reset wallet selection and form
            setSelectedWallet(null);
            reset();
            
            // Clear balance state
            setBalance(null);
            setHasInsufficientBalance(false);
            setBalanceError(null);
        } catch (error) {
            console.error('Disconnect failed:', error);
        }
    }, [selectedWallet, metaMaskWallet, simpleWallet, reset]);

    // Get wallet display name
    const getWalletDisplayName = (type: string) => {
        switch (type) {
            case 'phantom':
                return 'Phantom';
            case 'solflare':
                return 'Solflare';
            case 'metamask':
                return 'MetaMask';
            default:
                return type;
        }
    };

    return (
        <>
            <Head title="Connect Your Wallet">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <AuthLayout>
                <Card className="mx-auto w-full max-w-full">
                    <CardHeader>
                        <h1 className="text-2xl font-bold">Connect Wallet</h1>
                        <p className="text-muted-foreground">Get started by connecting your preferred wallet below.</p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Flash Messages */}
                        {flash?.success && (
                            <Alert>
                                <CheckCircle className="h-4 w-4" />
                                <AlertDescription>{flash.success}</AlertDescription>
                            </Alert>
                        )}

                        {flash?.error && (
                            <Alert variant="destructive">
                                <XCircle className="h-4 w-4" />
                                <AlertDescription>{flash.error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Error Messages */}
                        {(walletError || errors.wallet_address || errors.signature) && (
                            <Alert variant="destructive">
                                <XCircle className="h-4 w-4" />
                                <AlertDescription>{walletError || errors.wallet_address || errors.signature}</AlertDescription>
                            </Alert>
                        )}

                        {/* Wallet Connection Buttons */}
                        {!isConnected ? (
                            <div className="space-y-3">
                                <Button
                                    variant="outline"
                                    className="w-full border-slate-600"
                                    size="lg"
                                    onClick={() => handleConnectWallet('phantom')}
                                    disabled={isConnecting || processing}
                                >
                                    {isConnecting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Connecting...
                                        </>
                                    ) : (
                                        <>
                                            <Wallet className="mr-2 h-4 w-4" />
                                            Connect Phantom Wallet
                                        </>
                                    )}
                                </Button>

                                <Button
                                    variant="outline"
                                    className="w-full border-slate-600"
                                    size="lg"
                                    onClick={() => handleConnectWallet('solflare')}
                                    disabled={isConnecting || processing}
                                >
                                    {isConnecting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Connecting...
                                        </>
                                    ) : (
                                        <>
                                            <Wallet className="mr-2 h-4 w-4" />
                                            Connect Solflare Wallet
                                        </>
                                    )}
                                </Button>

                                <Button
                                    variant="outline"
                                    className="w-full border-slate-600"
                                    size="lg"
                                    onClick={() => handleConnectWallet('metamask')}
                                    disabled={isConnecting || processing}
                                >
                                    {isConnecting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Connecting...
                                        </>
                                    ) : (
                                        <>
                                            <Wallet className="mr-2 h-4 w-4" />
                                            Connect MetaMask Wallet
                                        </>
                                    )}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {/* Connected Wallet Info */}
                                <div className="rounded-lg border bg-muted/50 p-4">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-sm font-medium">Connected Wallet</span>
                                        <Badge>{getWalletDisplayName(walletType || '')}</Badge>
                                    </div>
                                    <p className="font-mono text-sm break-all text-muted-foreground">{walletAddress}</p>
                                </div>

                                {/* Token Balance Card - Only show when connected but not authenticated */}
                                {!auth?.web3?.isAuthenticated && (
                                    <div className="rounded-lg border bg-muted/50 p-4">
                                        <div className="mb-3 flex items-center justify-between">
                                            <span className="text-sm font-medium">Token Balance</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleRefreshBalance}
                                                disabled={isLoadingBalance}
                                                className="h-8 w-8 p-0"
                                            >
                                                <RefreshCw className={`h-4 w-4 ${isLoadingBalance ? 'animate-spin' : ''}`} />
                                            </Button>
                                        </div>

                                        {isLoadingBalance ? (
                                            <div className="flex items-center space-x-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span className="text-sm text-muted-foreground">Checking balance...</span>
                                            </div>
                                        ) : balanceError ? (
                                            <div className="space-y-2">
                                                <p className="text-sm text-red-600">{balanceError}</p>
                                                <Button variant="outline" size="sm" onClick={handleRefreshBalance} className="h-8">
                                                    <RefreshCw className="mr-2 h-3 w-3" />
                                                    Retry
                                                </Button>
                                            </div>
                                        ) : balance !== null ? (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-muted-foreground">Current Balance:</span>
                                                    <Badge variant={hasInsufficientBalance ? 'destructive' : 'default'} className="font-mono">
                                                        {balance.toLocaleString()} tokens
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-muted-foreground">Required Balance:</span>
                                                    <span className="font-mono text-sm">{web3Config?.minTokenBalanceFormatted} tokens</span>
                                                </div>
                                                {hasInsufficientBalance && (
                                                    <Alert variant="destructive" className="mt-2">
                                                        <AlertTriangle className="h-4 w-4" />
                                                        <AlertDescription className="text-sm">
                                                            Insufficient balance for authentication
                                                        </AlertDescription>
                                                    </Alert>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">Balance information unavailable</p>
                                        )}
                                    </div>
                                )}

                                {/* Authentication Status */}
                                {auth?.web3?.isAuthenticated ? (
                                    <Alert>
                                        <CheckCircle className="h-4 w-4" />
                                        <AlertDescription className="flex items-center justify-between">
                                            <span>Wallet authenticated successfully!</span>
                                            <Badge variant="outline">Balance: {auth.web3.balanceFormatted || '0'}</Badge>
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    <div className="space-y-4">
                                        <Alert>
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertDescription>
                                                Wallet connected but not authenticated. Please authenticate to continue.
                                            </AlertDescription>
                                        </Alert>

                                        {/* Authentication Button */}
                                        <Button className="w-full" onClick={handleAuthenticate} disabled={processing || isAuthenticating}>
                                            {processing || isAuthenticating ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Authenticating...
                                                </>
                                            ) : (
                                                <>
                                                    <Wallet className="mr-2 h-4 w-4" />
                                                    Authenticate
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}

                                {/* Disconnect Button */}
                                <Button className="w-full border-slate-600" variant="outline" onClick={handleDisconnect} disabled={processing}>
                                    Disconnect Wallet
                                </Button>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter>
                        <p className="text-sm text-muted-foreground">By connecting your wallet, you agree to the Terms of Service.</p>
                    </CardFooter>
                </Card>
            </AuthLayout>
        </>
    );
}
