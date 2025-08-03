<?php

return [
  /*
  |--------------------------------------------------------------------------
  | Solana Network Configuration
  |--------------------------------------------------------------------------
  |
  | Reference to Solana configuration for network settings.
  | See config/solana.php for detailed Solana network configuration.
  |
  */

  'network' => config('solana.network'),
  'rpc_url' => config('solana.endpoints.rpc'),
  'ws_url' => config('solana.endpoints.websocket'),

  /*
  |--------------------------------------------------------------------------
  | Token Configuration
  |--------------------------------------------------------------------------
  |
  | Configure the token settings for authentication.
  |
  */

  'token_mint_address' => env('TOKEN_MINT_ADDRESS', 'AgnN9mUVXm9QDdo9SZm7jPiqkcVJCpgpYp5KT5avSujs'),

  'min_token_balance' => env('MIN_TOKEN_BALANCE', 100000),

  'token_decimals' => env('TOKEN_DECIMALS', 9),

  /*
  |--------------------------------------------------------------------------
  | Authentication Settings
  |--------------------------------------------------------------------------
  |
  | Configure Web3 authentication settings.
  |
  */

  'auth' => [
    'guard' => 'web3',
    'provider' => 'web3_users',
    'session_lifetime' => env('WEB3_SESSION_LIFETIME', 60 * 24 * 7), // 7 days
  ],

  /*
  |--------------------------------------------------------------------------
  | Balance Checking Settings
  |--------------------------------------------------------------------------
  |
  | Configure real-time balance checking settings.
  |
  */

  'balance_check' => [
    'cache_duration' => env('WEB3_BALANCE_CACHE_DURATION', 30), // seconds
    'rate_limit' => [
      'max_attempts' => env('WEB3_BALANCE_RATE_LIMIT', 10),
      'decay_minutes' => env('WEB3_BALANCE_RATE_DECAY', 1),
    ],
  ],

  /*
  |--------------------------------------------------------------------------
  | Wallet Connection Settings
  |--------------------------------------------------------------------------
  |
  | Configure wallet connection settings.
  |
  */

  'wallet' => [
    'auto_connect' => env('WEB3_AUTO_CONNECT', true),
    'remember_connection' => env('WEB3_REMEMBER_CONNECTION', true),
    'supported_wallets' => [
      'phantom',
      'solflare',
      'backpack',
      'slope',
      'exodus',
    ],
  ],

  /*
  |--------------------------------------------------------------------------
  | Development & Security Settings
  |--------------------------------------------------------------------------
  |
  | Configure development and security settings.
  |
  */

  'disable_signature_verification' => env('WEB3_DISABLE_SIGNATURE_VERIFICATION', false),

  'test_wallets' => env('APP_ENV') === 'local' ? [
    // Test wallets with predefined balances (development only)
    // Format: 'wallet_address' => balance_in_smallest_unit
  ] : [],

  /*
  |--------------------------------------------------------------------------
  | Error Messages
  |--------------------------------------------------------------------------
  |
  | Configure error messages for Web3 authentication.
  |
  */

  'messages' => [
    'insufficient_balance' => 'Insufficient token balance for authentication.',
    'invalid_wallet' => 'Invalid wallet address format.',
    'connection_failed' => 'Failed to connect to wallet.',
    'balance_check_failed' => 'Failed to check token balance.',
    'authentication_failed' => 'Authentication failed.',
    'signature_verification_failed' => 'Signature verification failed.',
    'sodium_extension_missing' => 'Sodium extension required for signature verification.',
  ],
];