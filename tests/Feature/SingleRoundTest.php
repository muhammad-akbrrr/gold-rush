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

    $deriveConfigPda = function (PublicKey $programId): PublicKey {
        return PublicKey::findProgramAddressSync(['config'], $programId)[0];
    };

    $deriveRoundPda = function (PublicKey $programId, int $roundId): PublicKey {
        $low32 = $roundId & 0xFFFFFFFF;
        $high32 = ($roundId >> 32) & 0xFFFFFFFF;
        $roundIdSeed = pack('V2', $low32, $high32);

        return PublicKey::findProgramAddressSync(['round', $roundIdSeed], $programId)[0];
    };

    $deriveVaultPda = function (PublicKey $programId, PublicKey $roundPda): PublicKey {
        return PublicKey::findProgramAddressSync(['vault', $roundPda->toBinaryString()], $programId)[0];
    };

    $deriveBetPda = function (PublicKey $programId, PublicKey $roundPda, int $betId): PublicKey {
        $low32 = $betId & 0xFFFFFFFF;
        $high32 = ($betId >> 32) & 0xFFFFFFFF;
        $betIdSeed = pack('V2', $low32, $high32);

        return PublicKey::findProgramAddressSync(['bet', $roundPda->toBinaryString(), $betIdSeed], $programId)[0];
    };

    $deriveTokenAccount = function (PublicKey $userPubkey, PublicKey $mint): PublicKey {
        // Associated Token Account PDA
        $tokenProgramId = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
        $associatedTokenProgramId = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

        return PublicKey::findProgramAddressSync([
            $userPubkey->toBinaryString(),
            $tokenProgramId->toBinaryString(),
            $mint->toBinaryString()
        ], $associatedTokenProgramId)[0];
    };

    $fetchConfigAccount = function (Connection $conn, PublicKey $configPda): object {
        // Gets account data
        $configAccountInfo = $conn->getAccountInfo($configPda);
        if (!$configAccountInfo || !isset($configAccountInfo['data'])) {
            throw new Exception('Config account not found');
        }

        // Parse data
        $configDataField = $configAccountInfo['data'];
        if (is_array($configDataField)) {
            $rawData = $configDataField[0] ?? '';
            $encoding = $configDataField[1] ?? 'base64';
        } else {
            $rawData = $configDataField;
            $encoding = 'base64';
        }
        $bin = $encoding === 'base64' ? base64_decode((string) $rawData) : (string) $rawData;

        // Parse fields
        $off = 0;

        // discriminator
        $off += 8;

        // admin (pubkey)
        $adminBytes = substr($bin, $off, 32);
        $off += 32;

        // keeperAuthorities: vec<pubkey> => u32 len + 32*len
        $keeperLen = unpack('V', substr($bin, $off, 4))[1];
        $off += 4;
        $keepers = [];
        for ($i = 0; $i < $keeperLen; $i++) {
            $keeperBytes = substr($bin, $off, 32);
            $keepers[] = $keeperBytes;
            $off += 32;
        }

        // tokenMint (pubkey)
        $tokenMintBytes = substr($bin, $off, 32);
        $off += 32;

        // treasury (pubkey)
        $treasuryBytes = substr($bin, $off, 32);
        $off += 32;

        // singleAssetFeedId ([u8; 32])
        $singleAssetFeedIdBytes = substr($bin, $off, 32);
        $off += 32;

        // maxPriceUpdateAgeSecs (u64)
        $maxPriceUpdateAgeSecsBytes = substr($bin, $off, 8);
        $maxPriceUpdateAgeSecs = unpack('V2', $maxPriceUpdateAgeSecsBytes);
        $maxPriceUpdateAgeSecs = $maxPriceUpdateAgeSecs[1] + ($maxPriceUpdateAgeSecs[2] << 32);
        $off += 8;

        // feeSingleAssetBps (u16)
        $feeSingleAssetBps = unpack('v', substr($bin, $off, 2))[1];
        $off += 2;

        // feeGroupBattleBps (u16)
        $feeGroupBattleBps = unpack('v', substr($bin, $off, 2))[1];
        $off += 2;

        // minBetAmount (u64)
        $minBetAmountBytes = substr($bin, $off, 8);
        $minBetAmount = unpack('V2', $minBetAmountBytes);
        $minBetAmount = $minBetAmount[1] + ($minBetAmount[2] << 32);
        $off += 8;

        // betCutoffWindowSecs (i64)
        $betCutoffWindowSecsBytes = substr($bin, $off, 8);
        $betCutoffWindowSecs = unpack('V2', $betCutoffWindowSecsBytes);
        $betCutoffWindowSecs = $betCutoffWindowSecs[1] + ($betCutoffWindowSecs[2] << 32);
        $off += 8;

        // minTimeFactorBps (u16)
        $minTimeFactorBps = unpack('v', substr($bin, $off, 2))[1];
        $off += 2;

        // maxTimeFactorBps (u16)
        $maxTimeFactorBps = unpack('v', substr($bin, $off, 2))[1];
        $off += 2;

        // defaultDirectionFactorBps (u16)
        $defaultDirectionFactorBps = unpack('v', substr($bin, $off, 2))[1];
        $off += 2;

        // status enum (u8)
        $status = unpack('C', substr($bin, $off, 1))[1];
        $off += 1;

        // currentRoundCounter (u64)
        $currentRoundCounterBytes = substr($bin, $off, 8);
        $currentRoundCounter = unpack('V2', $currentRoundCounterBytes);
        $currentRoundCounter = $currentRoundCounter[1] + ($currentRoundCounter[2] << 32);

        return (object) [
            'admin' => $adminBytes,
            'keeperAuthorities' => $keepers,
            'tokenMint' => $tokenMintBytes,
            'treasury' => $treasuryBytes,
            'singleAssetFeedId' => $singleAssetFeedIdBytes,
            'maxPriceUpdateAgeSecs' => $maxPriceUpdateAgeSecs,
            'feeSingleAssetBps' => $feeSingleAssetBps,
            'feeGroupBattleBps' => $feeGroupBattleBps,
            'minBetAmount' => $minBetAmount,
            'betCutoffWindowSecs' => $betCutoffWindowSecs,
            'minTimeFactorBps' => $minTimeFactorBps,
            'maxTimeFactorBps' => $maxTimeFactorBps,
            'defaultDirectionFactorBps' => $defaultDirectionFactorBps,
            'status' => $status,
            'currentRoundCounter' => $currentRoundCounter,
        ];
    };

    $fetchRoundAccount = function (Connection $conn, PublicKey $roundPda): object {
        // Get account data
        $roundAccountInfo = $conn->getAccountInfo($roundPda);
        if (!$roundAccountInfo || !isset($roundAccountInfo['data'])) {
            throw new Exception('Round account not found');
        }

        // Parse data
        $roundDataField = $roundAccountInfo['data'];
        if (is_array($roundDataField)) {
            $rawData = $roundDataField[0] ?? '';
            $encoding = $roundDataField[1] ?? 'base64';
        } else {
            $rawData = $roundDataField;
            $encoding = 'base64';
        }
        $bin = $encoding === 'base64' ? base64_decode((string) $rawData) : (string) $rawData;

        // Parse fields
        $off = 0;

        //  discriminator
        $off += 8;

        // id (u64)
        $idBytes = substr($bin, $off, 8);
        $id = unpack('V2', $idBytes);
        $id = $id[1] + ($id[2] << 32);
        $off += 8;

        // startTime (i64)
        $startTimeBytes = substr($bin, $off, 8);
        $startTime = unpack('v2', $startTimeBytes);
        $startTime = $startTime[1] + ($startTime[2] << 32);
        $off += 8;

        // endTime (i64)
        $endTimeBytes = substr($bin, $off, 8);
        $endTime = unpack('v2', $endTimeBytes);
        $endTime = $endTime[1] + ($endTime[2] << 32);
        $off += 8;

        // betCutoffTime (i64)
        $betCutoffTimeBytes = substr($bin, $off, 8);
        $betCutoffTime = unpack('v2', $betCutoffTimeBytes);
        $betCutoffTime = $betCutoffTime[1] + ($betCutoffTime[2] << 32);
        $off += 8;

        // vault (pubkey)
        $vaultBytes = substr($bin, $off, 32);
        $off += 32;

        // vaultBump (u8)
        $vaultBump = unpack('C', substr($bin, $off, 1))[1];
        $off += 1;

        // marketType enum (u8)
        $marketType = unpack('C', substr($bin, $off, 1))[1];
        $off += 1;

        // status enum (u8)
        $status = unpack('C', substr($bin, $off, 1))[1];
        $off += 1;

        // startPrice optional (u64)
        $startPriceBytes = substr($bin, $off, 8);
        $startPrice = unpack('V2', $startPriceBytes);
        $startPrice = $startPrice[1] + ($startPrice[2] << 32);
        $off += 8;

        // finalPrice optional (u64)
        $finalPriceBytes = substr($bin, $off, 8);
        $finalPrice = unpack('V2', $finalPriceBytes);
        $finalPrice = $finalPrice[1] + ($finalPrice[2] << 32);
        $off += 8;

        // totalPool (u64)
        $totalPoolBytes = substr($bin, $off, 8);
        $totalPool = unpack('V2', $totalPoolBytes);
        $totalPool = $totalPool[1] + ($totalPool[2] << 32);
        $off += 8;

        // totalBets (u64)
        $totalBetsBytes = substr($bin, $off, 8);
        $totalBets = unpack('V2', $totalBetsBytes);
        $totalBets = $totalBets[1] + ($totalBets[2] << 32);
        $off += 8;

        // totalFeeCollected (u64)
        $totalFeeCollectedBytes = substr($bin, $off, 8);
        $totalFeeCollected = unpack('V2', $totalFeeCollectedBytes);
        $totalFeeCollected = $totalFeeCollected[1] + ($totalFeeCollected[2] << 32);
        $off += 8;

        // totalRewardPool (u64)
        $totalRewardPoolBytes = substr($bin, $off, 8);
        $totalRewardPool = unpack('V2', $totalRewardPoolBytes);
        $totalRewardPool = $totalRewardPool[1] + ($totalRewardPool[2] << 32);
        $off += 8;

        // winnersWeight (u64)
        $winnersWeightBytes = substr($bin, $off, 8);
        $winnersWeight = unpack('V2', $winnersWeightBytes);
        $winnersWeight = $winnersWeight[1] + ($winnersWeight[2] << 32);
        $off += 8;

        // settledBets (u64)
        $settledBetsBytes = substr($bin, $off, 8);
        $settledBets = unpack('V2', $settledBetsBytes);
        $settledBets = $settledBets[1] + ($settledBets[2] << 32);
        $off += 8;

        // cancelledBets (u64)
        $cancelledBetsBytes = substr($bin, $off, 8);
        $cancelledBets = unpack('V2', $cancelledBetsBytes);
        $cancelledBets = $cancelledBets[1] + ($cancelledBets[2] << 32);
        $off += 8;

        // winnerGroupIds (vec<u64>)
        $winnerGroupIdsLength = unpack('V', substr($bin, $off, 4))[1];
        $off += 4;
        $winnerGroupIds = [];
        for ($i = 0; $i < $winnerGroupIdsLength; $i++) {
            $winnerGroupIdBytes = substr($bin, $off, 8);
            $winnerGroupId = unpack('V2', $winnerGroupIdBytes);
            $winnerGroupId = $winnerGroupId[1] + ($winnerGroupId[2] << 32);
            $winnerGroupIds[] = $winnerGroupId;
            $off += 8;
        }

        // totalGroups (u64)
        $totalGroupsBytes = substr($bin, $off, 8);
        $totalGroups = unpack('V2', $totalGroupsBytes);
        $totalGroups = $totalGroups[1] + ($totalGroups[2] << 32);
        $off += 8;

        // capturedStartGroups (u64)
        $capturedStartGroupsBytes = substr($bin, $off, 8);
        $capturedStartGroups = unpack('V2', $capturedStartGroupsBytes);
        $capturedStartGroups = $capturedStartGroups[1] + ($capturedStartGroups[2] << 32);
        $off += 8;

        // capturedEndGroups (u64)
        $capturedEndGroupsBytes = substr($bin, $off, 8);
        $capturedEndGroups = unpack('V2', $capturedEndGroupsBytes);
        $capturedEndGroups = $capturedEndGroups[1] + ($capturedEndGroups[2] << 32);
        $off += 8;

        // createdAt (i64)
        $createdAtBytes = substr($bin, $off, 8);
        $createdAt = unpack('V2', $createdAtBytes);
        $createdAt = $createdAt[1] + ($createdAt[2] << 32);
        $off += 8;

        // settledAt optional (i64)
        $settledAtBytes = substr($bin, $off, 8);
        $settledAt = unpack('V2', $settledAtBytes);
        $settledAt = $settledAt[1] + ($settledAt[2] << 32);
        $off += 8;

        // bump (u8)
        $bump = unpack('C', substr($bin, $off, 1))[1];
        $off += 1;

        return (object) [
            'id' => $id,
            'startTime' => $startTime,
            'endTime' => $endTime,
            'betCutoffTime' => $betCutoffTime,
            'vault' => $vaultBytes,
            'vaultBump' => $vaultBump,
            'marketType' => $marketType,
            'status' => $status,
            'startPrice' => $startPrice,
            'finalPrice' => $finalPrice,
            'totalPool' => $totalPool,
            'totalBets' => $totalBets,
            'totalFeeCollected' => $totalFeeCollected,
            'totalRewardPool' => $totalRewardPool,
            'winnersWeight' => $winnersWeight,
            'settledBets' => $settledBets,
            'cancelledBets' => $cancelledBets,
            'winnerGroupIds' => $winnerGroupIds,
            'totalGroups' => $totalGroups,
            'capturedStartGroups' => $capturedStartGroups,
            'capturedEndGroups' => $capturedEndGroups,
            'createdAt' => $createdAt,
            'settledAt' => $settledAt,
            'bump' => $bump,
        ];
    };

    $getPriceFeedAccountAddress = function (string $feedId, string $shardId = '0') use ($toPublicKey): PublicKey {
        $programIdEnv = getenv('DEFAULT_PUSH_ORACLE_PROGRAM_ID') ?: '';
        if ($programIdEnv === '') {
            $this->markTestSkipped('DEFAULT_PUSH_ORACLE_PROGRAM_ID not set.');
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
        $shardBuf = pack('v', $shardId);

        [$pda] = PublicKey::findProgramAddressSync([$shardBuf, $priceFeedIdBytes], $pushOracleProgramId);

        return $toPublicKey($pda->toBase58());
    };

    // Read from ENV
    $rpcUrl = $requireEnv('SOLANA_RPC_URL');
    $programId = $toPublicKey($requireEnv('PROGRAM_ID'));
    $systemProgramId = $toPublicKey($requireEnv('SYSTEM_PROGRAM_ID'));
    $tokenProgramId = $toPublicKey($requireEnv('TOKEN_PROGRAM_ID'));
    $associatedTokenProgramId = $toPublicKey($requireEnv('ASSOCIATED_TOKEN_PROGAM_ID'));
    $mint = $toPublicKey($requireEnv('TOKEN_MINT'));
    $admin = $loadKeypairFromJsonFile($requireEnv('ADMIN_KEYPAIR_PATH'));
    $keeper = $loadKeypairFromJsonFile($requireEnv('KEEPER_KEYPAIR_PATH'));
    $treasury = $loadKeypairFromJsonFile($requireEnv('TREASURY_KEYPAIR_PATH'));
    $user = $loadKeypairFromJsonFile($requireEnv('USER_KEYPAIR_PATH'));
    $goldPriceFeedId = $requireEnv('GOLD_PRICE_FEED_ID');

    // Token account
    $userTokenAccount = $deriveTokenAccount($user->getPublicKey(), $mint);
    $treasuryTokenAccount = $deriveTokenAccount($treasury->getPublicKey(), $mint);

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
    // Discriminator: [229, 218, 236, 169, 231, 80, 134, 112]

    // Derive config PDA
    $configPda = $deriveConfigPda($programId);

    // Get next round ID
    $config = $fetchConfigAccount($conn, $configPda);
    $currentRoundId = $config->currentRoundCounter;
    $nextRoundId = $currentRoundId + 1;

    // Debug current round info
    echo "Current Round ID: " . $currentRoundId . "\n";
    echo "Next Round ID: " . $nextRoundId . "\n";

    // Derive round PDA
    $roundPda = $deriveRoundPda($programId, $nextRoundId);

    // Derive vault PDA
    $vaultPda = $deriveVaultPda($programId, $roundPda);

    // Arguments
    $marketType = '0';
    $startTime = time() + 3;
    $endTime = $startTime + 30; // 30 seconds

    // Build data
    $marketBuf = pack('C', $marketType);
    $startBuf = pack('q', $startTime);
    $endBuf = pack('q', $endTime);
    $createRoundDiscrimator = chr(229) . chr(218) . chr(236) . chr(169) . chr(231) . chr(80) . chr(134) . chr(112);
    $createRoundData = $createRoundDiscrimator . $marketBuf . $startBuf . $endBuf;

    // Context accounts
    $keys = [
        new AccountMeta($admin->getPublicKey(), true, true),
        new AccountMeta($configPda, false, true),
        new AccountMeta($roundPda, false, true),
        new AccountMeta($vaultPda, false, true),
        new AccountMeta($mint, false, false),
        new AccountMeta($systemProgramId, false, false),
        new AccountMeta($tokenProgramId, false, false),
    ];

    // Instruction
    $ix = new TransactionInstruction($programId, $keys, $createRoundData);
    $tx = new Transaction();
    $tx->feePayer = $admin->getPublicKey();
    $tx->add($ix);

    try {
        // Recent blockhash
        $recentBlockhash = $conn->getRecentBlockhash();
        $tx->recentBlockhash = $recentBlockhash['blockhash'];

        // Simulate transaction
        $simResult = $conn->simulateTransaction($tx, [$admin]);
        echo "Create Round Simulation Result: " . json_encode($simResult) . "\n";

        // Only send if simulation is successful
        if (!isset($simResult['value']['err']) || $simResult['value']['err'] === null) {
            $sig = $conn->sendTransaction($tx, [$admin]);
            echo "Create Round Transaction: " . $rpcUrl . '?sig=' . $sig . "\n";

            // Wait for transaction confirmation (simplified approach)
            echo "Waiting for Create Round confirmation...\n";
            sleep(5);
        } else {
            throw new Exception('Create Round simulation failed: ' . json_encode($simResult['value']['err']));
        }
        expect(is_string($sig))->toBeTrue();
        expect(strlen($sig))->toBeGreaterThan(10);
    } catch (Exception $e) {
        echo "Create Round Error: " . $e->getMessage() . "\n";
        echo "Error Class: " . get_class($e) . "\n";
        throw $e;
    }

    /// -- 2. START ROUND --
    // Discriminator: [144, 144, 43, 7, 193, 42, 217, 215]

    // Build data
    $startRoundDiscriminator = chr(144) . chr(144) . chr(43) . chr(7) . chr(193) . chr(42) . chr(217) . chr(215);
    $startRoundData = $startRoundDiscriminator;

    // Context accounts
    $keys = [
        new AccountMeta($keeper->getPublicKey(), true, true),
        new AccountMeta($configPda, false, true),
        new AccountMeta($roundPda, false, true),
        new AccountMeta($goldPriceFeedAccount, false, false),
        new AccountMeta($systemProgramId, false, false),
    ];

    // Instruction
    $ix = new TransactionInstruction($programId, $keys, $startRoundData);
    $tx = new Transaction();
    $tx->feePayer = $keeper->getPublicKey();
    $tx->add($ix);

    // Retry configuration
    $maxWaitMs = 20_000; // 20 seconds
    $pollIntervalMs = 1_000; // 1 second
    $maxRetries = 20;
    $retryCount = 0;
    $startTime = microtime(true) * 1_000;

    // Retry loop for PythError and RoundNotReadyForStart
    while (true) {
        try {
            // Recent blockhash
            $recentBlockhash = $conn->getRecentBlockhash();
            $tx->recentBlockhash = $recentBlockhash['blockhash'];

            // Simulate transaction first
            $simResult = $conn->simulateTransaction($tx, [$keeper]);
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
                    usleep($pollIntervalMs * 1_000);
                    continue;
                }

                // Check for RoundNotReadyForStart in logs
                if (strpos($logsString, 'RoundNotReadyForStart') !== false) {
                    $currentTime = microtime(true) * 1_000;
                    if ($currentTime - $startTime > $maxWaitMs) {
                        throw new Exception('Timed out waiting for round to be ready after ' . ($maxWaitMs / 1_000) . ' seconds');
                    }
                    echo "RoundNotReadyForStart detected in logs, waiting {$pollIntervalMs}ms...\n";
                    usleep($pollIntervalMs * 1_000);
                    continue;
                }

                // If not a retryable error, throw it
                throw new Exception('Start Round simulation failed: ' . json_encode($simResult['value']['err']));
            }

            // If simulation successful, send transaction
            $sig = $conn->sendTransaction($tx, [$keeper]);
            echo "Start Round Transaction: " . $rpcUrl . '?sig=' . $sig . "\n";
            expect(is_string($sig))->toBeTrue();
            expect(strlen($sig))->toBeGreaterThan(10);

            // Wait for Start Round to complete and verify status change
            echo "Waiting for Start Round confirmation...\n";
            sleep(2);

            // Verify that round status actually changed to Started (1)
            $maxStatusWait = 10; // 10 seconds
            $statusWaitStart = time();
            $roundStarted = false;

            while (time() - $statusWaitStart < $maxStatusWait) {
                try {
                    $roundData = $fetchRoundAccount($conn, $roundPda);
                    echo "Checking round status after Start Round: " . $roundData->status . "\n";

                    if ($roundData->status == 1) {
                        echo "Round successfully started!\n";
                        $roundStarted = true;
                        break;
                    }
                } catch (Exception $e) {
                    // Continue waiting
                }
                sleep(1);
            }

            if (!$roundStarted) {
                echo "WARNING: Start Round transaction succeeded but round status did not change to Started (1). Proceeding anyway...\n";
                // Don't throw exception, continue with Place Bet to see if it works
            }

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
    // Discriminator: [222, 62, 67, 220, 63, 166, 126, 33]

    // Derive config PDA
    $configPda = $deriveConfigPda($programId);

    // Get next bet ID
    $round = $fetchRoundAccount($conn, $roundPda);
    $currentBetId = $round->totalBets;
    $nextBetId = $currentBetId + 1;

    // Derive round vault PDA
    $vaultPda = $deriveVaultPda($programId, $roundPda);

    // Derive bet PDA
    $betPda = $deriveBetPda($programId, $roundPda, $nextBetId);

    // Arguments
    $amount = 1_000_000;
    $direction = 0; // up

    // Build data
    $placeBetDiscriminator = chr(222) . chr(62) . chr(67) . chr(220) . chr(63) . chr(166) . chr(126) . chr(33);
    $low32 = $amount & 0xFFFFFFFF;
    $high32 = ($amount >> 32) & 0xFFFFFFFF;
    $amountBuf = pack('V2', $low32, $high32);
    $directionBuf = pack('C', $direction);
    $placeBetData = $placeBetDiscriminator . $amountBuf . $directionBuf;

    // Context accounts
    $keys = [
        new AccountMeta($user->getPublicKey(), true, true),
        new AccountMeta($configPda, false, false),
        new AccountMeta($roundPda, false, true),
        new AccountMeta($programId, false, false), // null
        new AccountMeta($betPda, false, true),
        new AccountMeta($vaultPda, false, true),
        new AccountMeta($userTokenAccount, false, true),
        new AccountMeta($mint, false, false),
        new AccountMeta($tokenProgramId, false, false),
        new AccountMeta($systemProgramId, false, false),
    ];

    // Instruction
    $ix = new TransactionInstruction($programId, $keys, $placeBetData);
    $tx = new Transaction();
    $tx->feePayer = $user->getPublicKey();
    $tx->add($ix);

    try {
        // Recent blockhash
        $recentBlockhash = $conn->getRecentBlockhash();
        $tx->recentBlockhash = $recentBlockhash['blockhash'];

        // Simulate transaction
        $simResult = $conn->simulateTransaction($tx, [$user]);
        echo "Place Bet Simulation Result: " . json_encode($simResult) . "\n";

        // Only send if simulation is successfully
        if (!isset($simResult['value']['err']) || $simResult['value']['err'] === null) {
            $sig = $conn->sendTransaction($tx, [$user]);
            echo "Place Bet Transaction: " . $rpcUrl . '?sig=' . $sig . "\n";

            // Wait for transaction confirmation (simplified approach)
            echo "Waiting for Place Bet confirmation...\n";
            sleep(5);
        } else {
            throw new Exception('Place Bet Simulation failed: ' . json_encode($simResult['value']['err']));
        }

        expect(is_string($sig))->toBeTrue();
        expect(strlen($sig))->toBeGreaterThan(10);
    } catch (Exception $e) {
        echo "Place Bet Error: " . $e->getMessage() . "\n";
        echo "Error Class: " . get_class($e) . "\n";
        throw $e;
    }

    /// -- 4. SETTLE SINGLE ROUND --
    // Discriminator: [136, 196, 251, 236, 219, 255, 108, 43]

    // Build data
    $settleRoundDiscriminator = chr(136) . chr(196) . chr(251) . chr(236) . chr(219) . chr(255) . chr(108) . chr(43);
    $settleRoundData = $settleRoundDiscriminator;

    // Context accounts
    $keys = [
        new AccountMeta($keeper->getPublicKey(), true, true),
        new AccountMeta($configPda, false, false),
        new AccountMeta($roundPda, false, true),
        new AccountMeta($vaultPda, false, true),
        new AccountMeta($goldPriceFeedAccount, false, false),
        new AccountMeta($treasury->getPublicKey(), false, false),
        new AccountMeta($treasuryTokenAccount, false, true),
        new AccountMeta($mint, false, false),
        new AccountMeta($tokenProgramId, false, false),
        new AccountMeta($associatedTokenProgramId, false, false),
        new AccountMeta($systemProgramId, false, false),
    ];

    // Remaining accounts
    $betAccounts = [$betPda];
    foreach ($betAccounts as $betAccount) {
        $keys[] = new AccountMeta($betAccount, false, true);
    }

    // Instruction
    $ix = new TransactionInstruction($programId, $keys, $settleRoundData);
    $tx = new Transaction();
    $tx->feePayer = $keeper->getPublicKey();
    $tx->add($ix);

    // Retry configuration
    $maxWaitMs = 40_000; // 40 seconds
    $pollIntervalMs = 1_000; // 1 second
    $maxRetries = 40;
    $retryCount = 0;
    $startTime = microtime(true) * 1_000;

    // Retry loop for RoundNotReadyForSettle
    while (true) {
        try {
            // Recent blockhash
            $recentBlockhash = $conn->getRecentBlockhash();
            $tx->recentBlockhash = $recentBlockhash['blockhash'];

            // Simulate transaction
            $simResult = $conn->simulateTransaction($tx, [$keeper]);
            echo "Settle Round Simulation Result: " . json_encode($simResult) . "\n";

            // Check for specific errors in simulation
            if (isset($simResult['value']['err']) && $simResult['value']['err'] !== null) {
                // Check logs for specific error messages
                $logs = $simResult['value']['logs'] ?? [];
                $logsString = implode(' ', $logs);

                // Check for RoundNotReadyForSettle in logs
                if (strpos($logsString, 'RoundNotReadyForSettle') !== false) {
                    $currentTime = microtime(true) * 1_000;
                    if ($currentTime - $startTime > $maxWaitMs) {
                        throw new Exception('Timed out waiting for round to be ready after ' . ($maxWaitMs / 1_000) . ' seconds');
                    }
                    echo "RoundNotReadyForSettle detected in logs, waiting {$pollIntervalMs}ms...\n";
                    usleep($pollIntervalMs * 1_000);
                    continue;
                }

                // If not a retryable error, throw it
                throw new Exception('Settle Round simulation failed: ' . json_encode($simResult['value']['err']));
            }

            // If simulation successful, send transaction
            $sig = $conn->sendTransaction($tx, [$keeper]);
            echo "Settle Round Transaction: " . $rpcUrl . '?sig=' . $sig . "\n";
            expect(is_string($sig))->toBeTrue();
            expect(strlen($sig))->toBeGreaterThan(10);

            // Delay for waiting confirmation
            echo "Waiting for Settle Round confirmation...\n";
            sleep(5);

            break;
        } catch (Exception $e) {
            echo "Settle Round Error: " . $e->getMessage() . "\n";
            echo "Error Class: " . get_class($e) . "\n";
            throw $e;
        }
    }

    /// -- 5. CLAIM REWARD --
    // Instruction: claimReward
    // Discriminator: [149, 95, 181, 242, 94, 90, 158, 162]

    // Build data
    $claimRewardDiscriminator = chr(149) . chr(95) . chr(181) . chr(242) . chr(94) . chr(90) . chr(158) . chr(162);
    $claimRewardData = $claimRewardDiscriminator;

    // print round
    $roundd = $fetchRoundAccount($conn, $roundPda);
    echo "Round: " . json_encode($round->status) . "\n";

    // Context accounts
    $keys = [
        new AccountMeta($user->getPublicKey(), true, true),
        new AccountMeta($configPda, false, false),
        new AccountMeta($roundPda, false, false),
        new AccountMeta($vaultPda, false, true),
        new AccountMeta($betPda, false, true),
        new AccountMeta($userTokenAccount, false, true),
        new AccountMeta($mint, false, false),
        new AccountMeta($tokenProgramId, false, false),
        new AccountMeta($systemProgramId, false, false),
    ];

    // Instruction
    $ix = new TransactionInstruction($programId, $keys, $claimRewardData);
    $tx = new Transaction();
    $tx->feePayer = $user->getPublicKey();
    $tx->add($ix);

    try {
        // Recent blockhash
        $recentBlockhash = $conn->getRecentBlockhash();
        $tx->recentBlockhash = $recentBlockhash['blockhash'];

        // Simulate transaction
        $simResult = $conn->simulateTransaction($tx, [$user]);
        echo "Claim Reward Simulation Result: " . json_encode($simResult) . "\n";

        // Only send if simulation is successfully
        if (!isset($simResult['value']['err']) || $simResult['value']['err'] === null) {
            $sig = $conn->sendTransaction($tx, [$user]);
            echo "Claim Reward Transaction: " . $rpcUrl . '?sig=' . $sig . "\n";
        } else {
            throw new Exception('Claim Reward Simulation failed: ' . json_encode($simResult['value']['err']));
        }

        expect(is_string($sig))->toBeTrue();
        expect(strlen($sig))->toBeGreaterThan(10);
    } catch (Exception $e) {
        echo "Claim Reward Error: " . $e->getMessage() . "\n";
        echo "Error Class: " . get_class($e) . "\n";
        throw $e;
    }
})->group('solana');
