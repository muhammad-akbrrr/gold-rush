import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useUnifiedWallet } from '@/hooks/use-unified-wallet';
import { useWeb3Auth } from '@/hooks/use-web3-auth';
import AuthLayout from '@/layouts/auth-layout';
import { Head } from '@inertiajs/react';
import { CheckCircle, Loader2, RefreshCw, Wallet, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ConnectWallet() {
    const {
        isConnected,
        isConnecting,
        walletAddress,
        walletType,
        error: walletError,
        connectToWallet,
        disconnect,
        clearError: clearWalletError,
        // Token balance properties
        balanceFormatted,
        balanceLoading,
        balanceError,
        hasSufficientBalance,
        minRequiredBalanceFormatted,
        refreshBalance,
        clearBalanceError,
        tokenSymbol,
        tokenMintAddress,
    } = useUnifiedWallet();

    const { isAuthenticating, isAuthenticated, error: authError, authenticate, checkCanAuthenticate, clearError: clearAuthError } = useWeb3Auth();

    const [connectionStep, setConnectionStep] = useState<'idle' | 'connecting' | 'checking' | 'authenticating' | 'success' | 'error'>('idle');
    const [stepMessage, setStepMessage] = useState<string>('');

    // Handle wallet connection flow
    const handleConnectWallet = async (walletType: 'phantom' | 'solflare' | 'metamask') => {
        try {
            setConnectionStep('connecting');
            setStepMessage(`Connecting to ${walletType} wallet...`);
            clearWalletError();
            clearAuthError();
            clearBalanceError();

            await connectToWallet(walletType);

            // If we reach here, wallet connection was successful
            if (walletAddress) {
                setConnectionStep('checking');
                setStepMessage('Validating wallet address...');

                // Check if wallet can authenticate
                const canAuthResult = await checkCanAuthenticate(walletAddress);

                if (canAuthResult.success && canAuthResult.data?.can_authenticate) {
                    setConnectionStep('authenticating');
                    setStepMessage('Authenticating with server...');

                    // Authenticate with backend
                    const authResult = await authenticate(walletAddress);

                    if (authResult.success) {
                        setConnectionStep('success');
                        setStepMessage('Successfully authenticated!');
                    } else {
                        setConnectionStep('error');
                        setStepMessage(authResult.message || 'Authentication failed');
                    }
                } else {
                    setConnectionStep('error');
                    setStepMessage(canAuthResult.data?.errors?.[0] || 'Wallet cannot authenticate');
                }
            }
        } catch {
            // Reset connection step to idle so "Connecting..." message disappears
            setConnectionStep('idle');
            setStepMessage('');
            // The error will be displayed through the wallet error state
        }
    };

    // Handle disconnect
    const handleDisconnect = async () => {
        await disconnect();
        setConnectionStep('idle');
        setStepMessage('');
    };

    // Handle refresh balance
    const handleRefreshBalance = async () => {
        await refreshBalance();
    };

    // Reset connection state when wallet disconnects
    useEffect(() => {
        if (!isConnected) {
            setConnectionStep('idle');
            setStepMessage('');
        }
    }, [isConnected]);

    // Reset connection step when there's a wallet error
    useEffect(() => {
        if (walletError && connectionStep === 'connecting') {
            setConnectionStep('idle');
            setStepMessage('');
        }
    }, [walletError, connectionStep]);

    // Get step icon
    const getStepIcon = () => {
        switch (connectionStep) {
            case 'connecting':
            case 'checking':
            case 'authenticating':
                return <Loader2 className="h-4 w-4 animate-spin" />;
            case 'success':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'error':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Wallet className="h-4 w-4" />;
        }
    };

    // Get step color
    const getStepColor = () => {
        switch (connectionStep) {
            case 'success':
                return 'text-green-600';
            case 'error':
                return 'text-red-600';
            default:
                return 'text-blue-600';
        }
    };

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
                        {/* Connection Status */}
                        {connectionStep !== 'idle' && (
                            <Alert>
                                <AlertDescription className="flex items-center gap-2">
                                    {getStepIcon()}
                                    <span className={getStepColor()}>{stepMessage}</span>
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Error Messages */}
                        {(walletError || authError || balanceError) && (
                            <Alert variant="destructive">
                                <AlertDescription>{walletError || authError || balanceError}</AlertDescription>
                            </Alert>
                        )}

                        {/* Wallet Connection Buttons */}
                        {!isConnected ? (
                            <div className="space-y-3">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    size="lg"
                                    onClick={() => handleConnectWallet('phantom')}
                                    disabled={isConnecting || isAuthenticating}
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
                                    className="w-full"
                                    size="lg"
                                    onClick={() => handleConnectWallet('solflare')}
                                    disabled={isConnecting || isAuthenticating}
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
                                    className="w-full"
                                    size="lg"
                                    onClick={() => handleConnectWallet('metamask')}
                                    disabled={isConnecting || isAuthenticating}
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
                            <div className="space-y-4">
                                {/* Connected Wallet Info */}
                                <div className="rounded-lg border bg-muted/50 p-4">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-sm font-medium">Connected Wallet</span>
                                        <Badge>{getWalletDisplayName(walletType || '')}</Badge>
                                    </div>
                                    <p className="font-mono text-sm break-all text-muted-foreground">{walletAddress}</p>
                                </div>

                                {/* Balance Information */}
                                <div className="rounded-lg border bg-muted/50 p-4">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-sm font-medium">Token Balance</span>
                                        <Button variant="ghost" size="sm" onClick={handleRefreshBalance} disabled={balanceLoading}>
                                            <RefreshCw className={`h-3 w-3 ${balanceLoading ? 'animate-spin' : ''}`} />
                                        </Button>
                                    </div>

                                    {balanceLoading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span className="text-sm text-muted-foreground">Loading balance...</span>
                                        </div>
                                    ) : balanceError ? (
                                        <div className="flex items-center gap-2">
                                            <XCircle className="h-4 w-4 text-red-500" />
                                            <span className="text-sm text-red-600">{balanceError}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold">
                                                    {balanceFormatted} {tokenSymbol}
                                                </span>
                                                <Badge variant={hasSufficientBalance ? 'default' : 'destructive'}>
                                                    {hasSufficientBalance ? 'Sufficient' : 'Insufficient'}
                                                </Badge>
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Minimum required: {minRequiredBalanceFormatted} {tokenSymbol}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">Token Address: {tokenMintAddress}</p>
                                        </>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-row items-center justify-center gap-2">
                                    {!isAuthenticated && hasSufficientBalance && (
                                        <Button className="w-full" onClick={() => authenticate(walletAddress!)} disabled={isAuthenticating}>
                                            {isAuthenticating ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Authenticating...
                                                </>
                                            ) : (
                                                'Authenticate'
                                            )}
                                        </Button>
                                    )}
                                    <Button className="w-full" variant="outline" onClick={handleDisconnect}>
                                        Disconnect
                                    </Button>
                                </div>
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
