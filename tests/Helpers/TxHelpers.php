<?php

use Attestto\SolanaPhpSdk\Connection;
use Attestto\SolanaPhpSdk\SolanaRpcClient;
use Attestto\SolanaPhpSdk\Exceptions\AccountNotFoundException;

class TxHelpers
{
    /**
     * Confirm transaction
     */
    public static function confirmTransaction(
        SolanaRpcClient $client,
        string $signature,
        ?int $lastValidBlockHeight = null,
        string $commitment = 'confirmed',
        int $timeoutSec = 30,
        int $intervalMs = 500
    ): void {
        $deadline = microtime(true) + $timeoutSec;

        do {
            // Status signature
            $res = $client->call('getSignatureStatuses', [[$signature], ['searchTransactionHistory' => true]]);
            $st = $res['value']['0'];

            if ($st) {
                if (($st['err'] ?? null) !== null) {
                    throw new RuntimeException("Transaction failed: " . json_encode($st['err']));
                }

                $cs = $st['confirmationStatus'] ?? null;
                if ($commitment === 'confirmed' && ($cs === 'confirmed' || $cs === 'finalized')) return;
                if ($commitment === 'finalized' && $cs === 'finalized') return;
            }

            // Detect expiry blockhash
            if ($lastValidBlockHeight !== null) {
                $bh = $client->call('getBlockHeight', []);
                if ($bh > $lastValidBlockHeight) {
                    throw new RuntimeException("Blockhash expired: {$lastValidBlockHeight}");
                }
            }

            // Sleep for interval
            usleep($intervalMs * 1_000);
        } while (microtime(true) < $deadline);

        throw new RuntimeException("Timeout waiting for transaction commitment: {$signature}");
    }

    /**
     * Get account info with comitment
     */
    public static function getAccountInfoWithCommitment(
        SolanaRpcClient $client,
        string $pubKey,
        string $commitment = 'confirmed'
    ): ?array {
        $accountResponse = $client->call('getAccountInfo', [$pubKey, ['encoding' => 'base64', 'commitment' => $commitment]])['value'];

        if (! $accountResponse) {
            throw new AccountNotFoundException("API Error: Account {$pubKey} not found.");
        }

        return $accountResponse;
    }
}
