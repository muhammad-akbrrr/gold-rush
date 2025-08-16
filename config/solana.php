<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Solana Network Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains the configuration for Solana blockchain integration.
    | You can specify different RPC endpoints, network settings, and 
    | connection parameters for your Solana interactions.
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Network Settings
    |--------------------------------------------------------------------------
    |
    | Configure which Solana network to use: mainnet-beta, devnet, or testnet
    |
    */

    'network' => env('SOLANA_NETWORK', 'devnet'),

    /*
    |--------------------------------------------------------------------------
    | RPC Endpoints
    |--------------------------------------------------------------------------
    |
    | Configure the RPC and WebSocket endpoints for Solana network communication
    |
    */

    'endpoints' => [
        'rpc' => env('SOLANA_RPC_URL', 'https://api.devnet.solana.com'),
        'websocket' => env('SOLANA_WS_URL', 'wss://api.devnet.solana.com'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Connection Settings
    |--------------------------------------------------------------------------
    |
    | Configure connection timeouts and retry settings
    |
    */

    'connection' => [
        'timeout' => env('SOLANA_TIMEOUT', 10), // seconds
        'retry_attempts' => env('SOLANA_RETRY_ATTEMPTS', 3),
        'retry_delay' => env('SOLANA_RETRY_DELAY', 1000), // milliseconds
        'verify_ssl' => env('SOLANA_VERIFY_SSL', PHP_OS_FAMILY !== 'Windows'), // Disable SSL verification on Windows by default
    ],

    /*
    |--------------------------------------------------------------------------
    | Token Program Settings
    |--------------------------------------------------------------------------
    |
    | Configure settings for SPL Token program interactions
    |
    */

    'programs' => [
        'token' => 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
        'associated_token' => 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
        'system' => '11111111111111111111111111111112',
    ],

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting
    |--------------------------------------------------------------------------
    |
    | Configure rate limiting for Solana RPC calls
    |
    */

    'rate_limiting' => [
        'enabled' => env('SOLANA_RATE_LIMITING_ENABLED', true),
        'max_requests_per_minute' => env('SOLANA_MAX_REQUESTS_PER_MINUTE', 100),
        'burst_limit' => env('SOLANA_BURST_LIMIT', 20),
    ],

    /*
    |--------------------------------------------------------------------------
    | Caching Settings
    |--------------------------------------------------------------------------
    |
    | Configure caching for Solana data to reduce RPC calls
    |
    */

    'cache' => [
        'enabled' => env('SOLANA_CACHE_ENABLED', true),
        'default_ttl' => env('SOLANA_CACHE_TTL', 30), // seconds
        'balance_ttl' => env('SOLANA_BALANCE_CACHE_TTL', 30), // seconds
        'token_info_ttl' => env('SOLANA_TOKEN_INFO_CACHE_TTL', 3600), // 1 hour
    ],

    /*
    |--------------------------------------------------------------------------
    | Logging Configuration
    |--------------------------------------------------------------------------
    |
    | Configure logging for Solana operations
    |
    */

    'logging' => [
        'enabled' => env('SOLANA_LOGGING_ENABLED', true),
        'log_rpc_calls' => env('SOLANA_LOG_RPC_CALLS', false),
        'log_errors_only' => env('SOLANA_LOG_ERRORS_ONLY', false),
        'channel' => env('SOLANA_LOG_CHANNEL', 'single'),
    ],
];