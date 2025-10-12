<?php

use Attestto\SolanaPhpSdk\PublicKey;
use Attestto\SolanaPhpSdk\Keypair;

/**
 * Helpers function to manage wallet
 */
class WalletHelpers
{
    /**
     * Convert base58 string to Publickey 
     */
    public static function toPublicKey(string $bs58): PublicKey
    {
        return new PublicKey($bs58);
    }

    /**
     * Load keypair dari JSON file
     */
    public static function loadKeypairFromJsonFile(string $path): Keypair
    {
        if (!is_file($path)) {
            throw new Exception("Keypair file not found: {$path}");
        }

        $json = json_decode((string) file_get_contents($path), true);
        if (!is_array($json) || count($json) < 64) {
            throw new Exception("Format keypair JSON not valid (minimal 64 digits).");
        }

        $bytes = array_slice($json, 0, 64);
        $secret = call_user_func_array('pack', array_merge(['C*'], $bytes));
        return Keypair::fromSecretKey($secret);
    }
}
