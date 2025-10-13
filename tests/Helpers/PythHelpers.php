<?php

use Attestto\SolanaPhpSdk\PublicKey;

require_once __DIR__ . '/WalletHelpers.php';

/**
 * Helpers function to manage Pyth
 */
class PythHelpers
{
    /**
     * Get price feed account address
     */
    public static function getPriceFeedAccount(string $feedId, PublicKey $pushOracleProgramId, string $shardId = '0'): PublicKey
    {
        $hex = strtolower(trim($feedId));
        if (str_starts_with($hex, '0x')) {
            $hex = substr($hex, 2);
        }
        if ($hex === '' || !ctype_xdigit($hex) || (strlen($hex) % 2) !== 0) {
            throw new Exception('Feed ID must be string hex even (like 0x.. or without 0x).');
        }
        $priceFeedIdBytes = hex2bin($hex);
        if (strlen($priceFeedIdBytes) !== 32) {
            throw new Exception('Fee ID must be 32-byte hex (64 chars).');
        }

        if ($shardId < 0 || $shardId > 65535) {
            throw new Exception('Shard ID must be 0..65535.');
        }
        $shardBuf = pack('v', $shardId);

        [$pda] = PublicKey::findProgramAddressSync([$shardBuf, $priceFeedIdBytes], $pushOracleProgramId);

        return WalletHelpers::toPublicKey($pda->toBase58());
    }
}
