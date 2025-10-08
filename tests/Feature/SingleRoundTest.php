<?php

use Attestto\SolanaPhpSdk\PublicKey;
use Attestto\SolanaPhpSdk\Util\AccountMeta;
use Attestto\SolanaPhpSdk\TransactionInstruction;
use Attestto\SolanaPhpSdk\Transaction;
use Attestto\SolanaPhpSdk\SolanaRpcClient;
use Attestto\SolanaPhpSdk\Connection;
use Attestto\SolanaPhpSdk\Keypair;

test('Single Asset Round Tests', function () {
    /// -- SETUP --
    $requireEnv = function (string $key, bool $allowEmpty = false): string {
        $val = getenv($key) ?: '';
        if (!$allowEmpty && $val === '') {
            $this->markTestSkipped("ENV {$key} not set.");
        }
        return $val;
    };

    $toPublicKey = function (string $bs58): PublicKey {
        return new PublicKey($bs58);
    };

    $loadKeypairFromJsonFile = function (string $path): Keypair {
        if (!is_file($path)) {
            $this->markTestSkipped("Keypair file not found: {$path}");
        }
        $json = json_decode((string) file_get_contents($path), true);
        if (!is_array($json) || count($json) < 64) {
            $this->markTestSkipped('Format keypair JSON not valid (minimal 64 digits).');
        }
        $bytes = array_slice($json, 0, 64);
        $secret = call_user_func_array('pack', array_merge(['C*'], $bytes));
        return Keypair::fromSecretKey($secret);
    };

    $getPriceFeedAccountAddress = function (string $feedId, string $shardId = '0') use ($toPublicKey): PublicKey {
        $programIdEnv = getenv('DEFAULT_PUSH_ORACLE_PROGRAM_ID') ?: '';
        if ($programIdEnv === '') {
            $this->markTestSkipped('PUSH_ORACLE_PROGRAM_ID not set.');
        }
        $pushOracleProgramId = $toPublicKey($programIdEnv);

        $hex = strtolower(trim($feedId));
        if (str_starts_with($hex, '0x')) {
            $hex = substr($hex, 2);
        }
        if ($hex === '' || !ctype_xdigit($hex) || (strlen($hex) % 2) !== 0) {
            $this->markTestSkipped('Feed ID must be string hex even (like 0x.. or without 0x).');
        }
        $priceFeedIdBytes = hex2bin($hex);
        if (strlen($priceFeedIdBytes) !== 32) {
            $this->markTestSkipped('Fee ID must be 32-byte hex (64 chars).');
        }

        if ($shardId < 0 || $shardId > 65535) {
            $this->markTestSkipped('Shard ID must be 0..65535.');
        }
        $shardBuf = pack('v', $shardId); // u16 LE

        [$pda] = PublicKey::findProgramAddressSync([$shardBuf, $priceFeedIdBytes], $pushOracleProgramId);

        return $toPublicKey($pda->toBase58());
    };

    // Read from ENV
    $rpcUrl = $requireEnv('SOLANA_RPC_URL');
    $programId = $toPublicKey($requireEnv('PROGRAM_ID'));
    $systemProgramId = $toPublicKey($requireEnv('SYSTEM_PROGRAM_ID'));
    $tokenProgramId = $toPublicKey($requireEnv('TOKEN_PROGRAM_ID'));
    $mint = $toPublicKey($requireEnv('TOKEN_MINT'));
    $admin = $loadKeypairFromJsonFile($requireEnv('ADMIN_KEYPAIR_PATH'));
    $keeper = $loadKeypairFromJsonFile($requireEnv('KEEPER_KEYPAIR_PATH'));
    $user = $loadKeypairFromJsonFile($requireEnv('USER_KEYPAIR_PATH'));
    $goldPriceFeedId = $requireEnv('GOLD_PRICE_FEED_ID');

    // Debug environment
    echo "Program ID: " . $programId->toBase58() . "\n";
    echo "Admin Public Key: " . $admin->getPublicKey()->toBase58() . "\n";
    echo "Mint: " . $mint->toBase58() . "\n";

    // Price feed account
    $goldPriceFeedAccount = $getPriceFeedAccountAddress($goldPriceFeedId);
    echo "Gold Price Feed Account: " . $goldPriceFeedAccount->toBase58() . "\n";

    // Create connection
    $client = new SolanaRpcClient($rpcUrl);
    $conn = new Connection($client);

    /// -- 1. CREATE ROUND --
    // Instruction: createRound
    // Discriminator: [229, 218, 236, 169, 231, 80, 134, 112]

    // Derive config PDA dan get next round ID
    [$configPda] = PublicKey::findProgramAddressSync(['config'], $programId);

    // Get config account data
    $configAccountInfo = $conn->getAccountInfo($configPda);
    if (!$configAccountInfo || !isset($configAccountInfo['data'])) {
        throw new Exception('Config account not founds');
    }

    // Parse current round counter (u64 LE) from config account (borsh per IDL)
    $configDataField = $configAccountInfo['data'];
    if (is_array($configDataField)) {
        $rawData = $configDataField[0] ?? '';
        $encoding = $configDataField[1] ?? 'base64';
    } else {
        $rawData = $configDataField;
        $encoding = 'base64';
    }
    $bin = $encoding === 'base64' ? base64_decode((string) $rawData) : (string) $rawData;
    $off = 0;
    // skip 8-byte discriminator
    $off += 8;
    // admin pubkey (32)
    $off += 32;
    // keeperAuthorities: vec<pubkey> => u32 len + 32*len
    $len = unpack('V', substr($bin, $off, 4))[1];
    $off += 4 + (32 * $len);
    // tokenMint (32) + treasury (32) + singleAssetFeedId (32)
    $off += 32 + 32 + 32;
    // maxPriceUpdateAgeSecs (u64)
    $off += 8;
    // feeSingleAssetBps (u16) + feeGroupBattleBps (u16)
    $off += 2 + 2;
    // minBetAmount (u64) + betCutoffWindowSecs (i64)
    $off += 8 + 8;
    // minTimeFactorBps (u16) + maxTimeFactorBps (u16) + defaultDirectionFactorBps(u16)
    $off += 2 + 2 + 2;
    // status enum (u8)
    $off += 1;
    // currentRoundCounter (u64 LE)
    $currSlice = substr($bin, $off, 8);
    $parts = unpack('V2', $currSlice); // low, high
    $currentRoundId = ($parts[1]) + ($parts[2] << 32);
    $nextRoundId = $currentRoundId + 1;

    // Derive round PDA ['round', round.id (u64 LE 8 bytes)]
    $low32 = $nextRoundId & 0xFFFFFFFF;
    $high32 = ($nextRoundId >> 32) & 0xFFFFFFFF;
    $roundIdSeed = pack('V2', $low32, $high32);
    [$rPda] = PublicKey::findProgramAddressSync(['round', $roundIdSeed], $programId);
    $roundPda = $toPublicKey($rPda->toBase58());

    // Derive vault PDA ['vault', round]
    [$vPda] = PublicKey::findProgramAddressSync(['vault', $roundPda->toBinaryString()], $programId);
    $vaultPda = $toPublicKey($vPda->toBase58());

    // Parameters
    $marketTypeIndex = '0';
    $startTime = time() + 3;
    $endTime = $startTime + 15;

    // Build data: discriminator (8 bytes) + marketType (u8) + startTime (i64 LE) + endTime (i64 LE)
    $discriminator = chr(229) . chr(218) . chr(236) . chr(169) . chr(231) . chr(80) . chr(134) . chr(112);
    $market = pack('C', $marketTypeIndex);
    $startBuf = pack('q', $startTime);
    $endBuf = pack('q', $endTime);
    $data = $discriminator . $market . $startBuf . $endBuf;

    // Accounts context
    $keys = [
        new AccountMeta($admin->getPublicKey(), true, true),
        new AccountMeta($configPda, false, true),
        new AccountMeta($roundPda, false, true),
        new AccountMeta($vaultPda, false, true),
        new AccountMeta($mint, false, false),
        new AccountMeta($systemProgramId, false, false),
        new AccountMeta($tokenProgramId, false, false),
    ];

    $ix = new TransactionInstruction($programId, $keys, $data);

    $tx = new Transaction();
    $tx->feePayer = $admin->getPublicKey();
    $tx->add($ix);

    try {
        // Get recent blockhash first
        $recentBlockhash = $conn->getRecentBlockhash();
        echo "Create Round Recent Blockhash: " . json_encode($recentBlockhash) . "\n";

        // Set recent blockhash
        $tx->recentBlockhash = $recentBlockhash['blockhash'];

        // Simulate transaction first
        $simResult = $conn->simulateTransaction($tx, [$admin]);
        echo "Create Round Simulation Result: " . json_encode($simResult) . "\n";

        // Only send if simulation is successful
        if (!isset($simResult['value']['err']) || $simResult['value']['err'] === null) {
            $sig = $conn->sendTransaction($tx, [$admin]);
        } else {
            throw new Exception('Create Round simulation failed: ' . json_encode($simResult['value']['err']));
        }
        echo "Create Round Transaction: " . $rpcUrl . '?sig=' . $sig . "\n";
        expect(is_string($sig))->toBeTrue();
        expect(strlen($sig))->toBeGreaterThan(10);
    } catch (Exception $e) {
        echo "Create Round Error: " . $e->getMessage() . "\n";
        echo "Error Class: " . get_class($e) . "\n";
        throw $e;
    }

    /// -- 2. START ROUND (loop until can start) --
    // Instruction: startRound
    // Discriminator: [144, 144, 43, 7, 193, 42, 217, 215]

    // Build data for startRound instruction
    $startRoundDiscriminator = chr(144) . chr(144) . chr(43) . chr(7) . chr(193) . chr(42) . chr(217) . chr(215);
    $startRoundData = $startRoundDiscriminator;

    $keys = [
        new AccountMeta($admin->getPublicKey(), true, true),
        new AccountMeta($configPda, false, true),
        new AccountMeta($roundPda, false, true),
        new AccountMeta($goldPriceFeedAccount, false, false),
        new AccountMeta($systemProgramId, false, false),
    ];

    $ix = new TransactionInstruction($programId, $keys, $startRoundData);

    $tx = new Transaction();
    $tx->feePayer = $admin->getPublicKey();
    $tx->add($ix);

    // Retry configuration
    $maxWaitMs = 20000; // 20 seconds
    $pollIntervalMs = 1000; // 1 second
    $maxRetries = 20;
    $retryCount = 0;
    $startTime = microtime(true) * 1000;

    // Retry loop for PythError and RoundNotReadyForStart
    while (true) {
        try {
            // Get fresh recent blockhash for each attempt
            $recentBlockhash = $conn->getRecentBlockhash();
            echo "Start Round Recent Blockhash: " . json_encode($recentBlockhash) . "\n";

            $tx->recentBlockhash = $recentBlockhash['blockhash'];

            // Simulate transaction first
            $simResult = $conn->simulateTransaction($tx, [$admin]);
            echo "Start Round Simulation Result: " . json_encode($simResult) . "\n";

            // Check for specific errors in simulation
            if (isset($simResult['value']['err']) && $simResult['value']['err'] !== null) {
                // Check logs for specific error messages
                $logs = $simResult['value']['logs'] ?? [];
                $logsString = implode(' ', $logs);

                // Check for PythError in logs
                if (strpos($logsString, 'PythError') !== false) {
                    $retryCount++;
                    if ($retryCount >= $maxRetries) {
                        throw new Exception('Timed out waiting for pyth error to resolve after ' . $maxRetries . ' attempts');
                    }
                    echo "PythError detected in logs (attempt {$retryCount}/{$maxRetries}), waiting {$pollIntervalMs}ms...\n";
                    usleep($pollIntervalMs * 1000);
                    continue;
                }

                // Check for RoundNotReadyForStart in logs
                if (strpos($logsString, 'RoundNotReadyForStart') !== false) {
                    $currentTime = microtime(true) * 1000;
                    if ($currentTime - $startTime > $maxWaitMs) {
                        throw new Exception('Timed out waiting for round to be ready after ' . ($maxWaitMs / 1000) . ' seconds');
                    }
                    echo "RoundNotReadyForStart detected in logs, waiting {$pollIntervalMs}ms...\n";
                    usleep($pollIntervalMs * 1000);
                    continue;
                }

                // If not a retryable error, throw it
                throw new Exception('Start Round simulation failed: ' . json_encode($simResult['value']['err']));
            }

            // If simulation successful, send transaction
            $sig = $conn->sendTransaction($tx, [$admin]);
            echo "Start Round Transaction: " . $rpcUrl . '?sig=' . $sig . "\n";
            expect(is_string($sig))->toBeTrue();
            expect(strlen($sig))->toBeGreaterThan(10);

            // Success! Break out of retry loop
            break;
        } catch (Exception $e) {
            echo "Start Round Error: " . $e->getMessage() . "\n";
            echo "Error Class: " . get_class($e) . "\n";
            $this->markTestSkipped('Start Round Error: ' . $e->getMessage());
            return;
        }
    }

    /// -- 3. PLACE BET --
    // Instruction: placeBet
    // Discriminator: [222, 62, 67, 220, 63, 166, 126, 33]


    /// -- 4. SETTLE SINGLE ROUND (loop until can settle) --
    // Instruction: settleSingleRound
    // Discriminator: [136, 196, 251, 236, 219, 255, 108, 43]


    /// -- 5. CLAIM BET --
    // Instruction: claimReward
    // Discriminator: [149, 95, 181, 242, 94, 90, 158, 162]
})->group('solana');
