<?php

use App\Exceptions\Web3AuthenticationException;
use App\Exceptions\InsufficientTokenBalanceException;
use App\Exceptions\InvalidWalletAddressException;
use App\Exceptions\SolanaRpcException;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\Web3AuthMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Support\Facades\Log;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        // Register Web3 middleware
        $middleware->alias([
            'web3.auth' => Web3AuthMiddleware::class,
        ]);

        // Exclude Web3 routes from CSRF protection (like API routes)
        $middleware->validateCsrfTokens(except: [
            'web3/*',
        ]);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Handle Web3 Authentication Exceptions
        $exceptions->render(function (Web3AuthenticationException $e, $request) {
            // Log the authentication failure for security monitoring
            Log::warning('Web3 authentication failed', [
                'wallet_address' => $e->getWalletAddress(),
                'authentication_step' => $e->getAuthenticationStep(),
                'message' => $e->getMessage(),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'context' => $e->getContext(),
            ]);

            return $e->render($request);
        });

        // Handle Insufficient Token Balance Exceptions
        $exceptions->render(function (InsufficientTokenBalanceException $e, $request) {
            // Log balance issues for monitoring
            Log::info('Insufficient token balance detected', [
                'wallet_address' => $e->getWalletAddress(),
                'current_balance' => $e->getCurrentBalance(),
                'required_balance' => $e->getRequiredBalance(),
                'deficit' => $e->getDeficit(),
                'operation' => $e->getOperation(),
                'ip' => $request->ip(),
            ]);

            return $e->render($request);
        });

        // Handle Invalid Wallet Address Exceptions
        $exceptions->render(function (InvalidWalletAddressException $e, $request) {
            // Log validation failures for security monitoring
            Log::warning('Invalid wallet address validation', [
                'wallet_address' => $e->getWalletAddress(),
                'validation_reason' => $e->getValidationReason(),
                'validation_errors' => $e->getValidationErrors(),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return $e->render($request);
        });

        // Handle Solana RPC Exceptions
        $exceptions->render(function (SolanaRpcException $e, $request) {
            // Log RPC errors for system monitoring
            Log::error('Solana RPC error', [
                'rpc_method' => $e->getRpcMethod(),
                'rpc_url' => $e->getRpcUrl(),
                'failure_reason' => $e->getFailureReason(),
                'retryable' => $e->isRetryable(),
                'message' => $e->getMessage(),
                'context' => $e->getContext(),
            ]);

            return $e->render($request);
        });
    })->create();
