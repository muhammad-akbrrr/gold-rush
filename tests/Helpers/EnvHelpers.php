<?php

require_once __DIR__ . '/WalletHelpers.php';

/**
 * Helpers function to manage environment variables
 */
class EnvHelpers
{
    /**
     * Get enviroment variable
     */
    public static function requireEnv(string $key, bool $allowEmpty = false): string
    {
        $val = getenv($key) ?: '';
        if (!$allowEmpty && $val === '') {
            throw new Exception("ENV {$key} not set.");
        }

        return $val;
    }

    /**
     * Get all env
     */
    public static function loadAllEnv(): object
    {
        return (object) [
            'rpcUrl' => self::requireEnv('SOLANA_RPC_URL'),
            'programId' => WalletHelpers::toPublicKey(self::requireEnv('PROGRAM_ID')),
            'systemProgramId' => WalletHelpers::toPublicKey(self::requireEnv('SYSTEM_PROGRAM_ID')),
            'tokenProgramId' => WalletHelpers::toPublicKey(self::requireEnv('TOKEN_PROGRAM_ID')),
            'associatedTokenProgramId' => WalletHelpers::toPublicKey(self::requireEnv('ASSOCIATED_TOKEN_PROGAM_ID')),
            'mint' => WalletHelpers::toPublicKey(self::requireEnv('TOKEN_MINT')),
            'admin' => WalletHelpers::loadKeypairFromJsonFile(self::requireEnv('ADMIN_KEYPAIR_PATH')),
            'keeper' => WalletHelpers::loadKeypairFromJsonFile(self::requireEnv('KEEPER_KEYPAIR_PATH')),
            'treasury' => WalletHelpers::loadKeypairFromJsonFile(self::requireEnv('TREASURY_KEYPAIR_PATH')),
            'user' => WalletHelpers::loadKeypairFromJsonFile(self::requireEnv('USER_KEYPAIR_PATH')),
            'goldPriceFeedId' => self::requireEnv('GOLD_PRICE_FEED_ID'),
            'pushOracleProgramId' => WalletHelpers::toPublicKey(self::requireEnv('PUSH_ORACLE_PROGRAM_ID')),
        ];
    }
}
