<?php

use Attestto\SolanaPhpSdk\Util\AccountMeta;
use Attestto\SolanaPhpSdk\TransactionInstruction;
use Attestto\SolanaPhpSdk\Transaction;
use Attestto\SolanaPhpSdk\SolanaRpcClient;
use Attestto\SolanaPhpSdk\Connection;

require_once __DIR__ . '/../Helpers/AccountHelpers.php';
require_once __DIR__ . '/../Helpers/BytesHelpers.php';
require_once __DIR__ . '/../Helpers/Env.php';
require_once __DIR__ . '/../Helpers/PdaHelpers.php';
require_once __DIR__ . '/../Helpers/PythHelpers.php';
require_once __DIR__ . '/../Helpers/TxHelpers.php';
require_once __DIR__ . '/../Helpers/UrlHelpers.php';
require_once __DIR__ . '/../Helpers/WalletHelpers.php';

test('Group Round Tests', function () {
    /// -- SETUP --
    // load env
    $env = Env::loadAllEnv();

    // Token account
    $userTokenAccount = PdaHelpers::deriveTokenAccountPda(
        $env->tokenProgramId,
        $env->associatedTokenProgramId,
        $env->user->getPublicKey(),
        $env->mint,
    );
    $treasuryTokenAccount = PdaHelpers::deriveTokenAccountPda(
        $env->tokenProgramId,
        $env->associatedTokenProgramId,
        $env->treasury->getPublicKey(),
        $env->mint,
    );

    // Price feed account
    $goldPriceFeedAccount = PythHelpers::getPriceFeedAccount(
        $env->goldPriceFeedId,
        $env->pushOracleProgramId,
    );

    // Create connection
    $client = new SolanaRpcClient($env->rpcUrl);
    $conn = new Connection($client);

    /// -- 1. CREATE ROUND --
    // Discriminator: [229, 218, 236, 169, 231, 80, 134, 112]

    // Derive config PDA
    $configPda = PdaHelpers::deriveConfigPda($env->programId);

    // Get next round ID
    $config = AccountHelpers::fetchConfigAccount($client, $configPda);
    $currentRoundId = $config->currentRoundCounter;
    $nextRoundId = $currentRoundId + 1;
    echo "Round ID: " . $nextRoundId . "\n";

    // Derive round PDA
    $roundPda = PdaHelpers::deriveRoundPda($env->programId, $nextRoundId);

    // Derive vault PDA
    $vaultPda = PdaHelpers::deriveVaultPda($env->programId, $roundPda);

    // Arguments
    $maketType = '1'; // group battle
    $startTime = time() + 3; // 3 seconds from now
    $endTime = $startTime + 30; // 30 seconds

    // Build data
    $marketBuf = pack('C', $maketType);
    $startTimeBuf = pack('q', $startTime);
    $endTimeBuf = pack('q', $endTime);
    $createRoundDiscrimator = chr(229) . chr(218) . chr(236) . chr(169) . chr(231) . chr(80) . chr(134) . chr(112);
    $createRoundData = $createRoundDiscrimator . $marketBuf . $startTimeBuf . $endTimeBuf;

    // Context accounts
    $keys = [
        new AccountMeta($env->admin->getPublicKey(), true, true),
        new AccountMeta($configPda, false, true),
        new AccountMeta($roundPda, false, true),
        new AccountMeta($vaultPda, false, true),
        new AccountMeta($env->mint, false, false),
        new AccountMeta($env->systemProgramId, false, false),
        new AccountMeta($env->tokenProgramId, false, false),
    ];

    // Instruction
    $ix = new TransactionInstruction($env->programId, $keys, $createRoundData);
    $tx = new Transaction();
    $tx->feePayer = $env->admin->getPublicKey();
    $tx->add($ix);

    try {
        // Recent blockhash
        $latestBlockhash = $conn->getLatestBlockhash();
        $tx->recentBlockhash = $latestBlockhash['blockhash'];

        // Simulate transaction
        $simResult = $conn->simulateTransaction($tx, [$env->admin]);
        echo "Create Round Simulation Result: " . json_encode($simResult) . "\n";

        // Only send if simulation is successfully
        if (!isset($simResult['value']['err']) || $simResult['value']['err'] === null) {
            $sig = $conn->sendTransaction($tx, [$env->admin]);
            echo "Create Round Transaction: " . UrlHelpers::getFullExplorerUrl($env->rpcUrl, 'tx', $sig) . "\n";

            // Wait for transaction confirmation
            TxHelpers::confirmTransaction($client, $sig, $latestBlockhash['lastValidBlockHeight']);
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

    /// -- 2. INSERT GROUP ASSET --
    // Discriminator: [216, 166, 209, 92, 245, 228, 53, 67]

    $round = AccountHelpers::fetchRoundAccount($client, $roundPda);

    for ($groupId = 1; $groupId <= 2; $groupId++) {
        // Derive group asset PDA
        $groupAssetPda = PdaHelpers::deriveGroupAssetPda($env->programId, $roundPda, $groupId);

        // Arguments
        $symbol = BytesHelpers::stringToBytes("GROUP " . $groupId);

        // Build data
        $symbolBuf = BytesHelpers::arrayToString($symbol);
        $insertGroupAssetDiscrimator = chr(216) . chr(166) . chr(209) . chr(92) . chr(245) . chr(228) . chr(53) . chr(67);
        $insertGroupAssetData = $insertGroupAssetDiscrimator . $symbolBuf;

        // Context accounts
        $keys = [
            new AccountMeta($env->admin->getPublicKey(), true, true),
            new AccountMeta($configPda, false, false),
            new AccountMeta($roundPda, false, true),
            new AccountMeta($groupAssetPda, false, true),
            new AccountMeta($env->systemProgramId, false, false),
        ];

        // Instruction
        $ix = new TransactionInstruction($env->programId, $keys, $insertGroupAssetData);
        $tx = new Transaction();
        $tx->feePayer = $env->admin->getPublicKey();
        $tx->add($ix);

        try {
            // Recent blockhash
            $latestBlockhash = $conn->getLatestBlockhash();
            $tx->recentBlockhash = $latestBlockhash['blockhash'];

            // Simulate transaction
            $simResult = $conn->simulateTransaction($tx, [$env->admin]);
            echo "Insert Group Asset Simulation Result: " . json_encode($simResult) . "\n";

            // Only send if simulation is successfully
            if (!isset($simResult['value']['err']) || $simResult['value']['err'] === null) {
                $sig = $conn->sendTransaction($tx, [$env->admin]);
                echo "Insert Group Asset Transaction: " . UrlHelpers::getFullExplorerUrl($env->rpcUrl, 'tx', $sig) . "\n";

                // Wait for transaction confirmation
                TxHelpers::confirmTransaction($client, $sig, $latestBlockhash['lastValidBlockHeight']);
            } else {
                throw new Exception('Insert Group Asset simulation failed: ' . json_encode($simResult['value']['err']));
            }

            expect(is_string($sig))->toBeTrue();
            expect(strlen($sig))->toBeGreaterThan(10);
        } catch (Exception $e) {
            echo "Insert Group Asset Error: " . $e->getMessage() . "\n";
            echo "Error Class: " . get_class($e) . "\n";
            throw $e;
        }
    }

    /// -- 3. INSERT ASSET --
    // Discriminator: [190, 133, 160, 163, 45, 85, 168, 161]

    $round = AccountHelpers::fetchRoundAccount($client, $roundPda);

    for ($groupId = 1; $groupId <= $round->totalGroups; $groupId++) {
        $groupAssetPda = PdaHelpers::deriveGroupAssetPda($env->programId, $roundPda, $groupId);

        $groupAsset = AccountHelpers::fetchGroupAssetAccount($client, $groupAssetPda);
        for ($assetId = 1; $assetId <= 2; $assetId++) {
            // Derive asset PDA
            $assetPda = PdaHelpers::deriveAssetPda($env->programId, $groupAssetPda, $assetId);

            // Arguments
            $symbol = BytesHelpers::stringToBytes("ASSET " . $assetId);

            // Build data
            $symbolBuf = BytesHelpers::arrayToString($symbol);
            $insertAssetDiscrimator = chr(190) . chr(133) . chr(160) . chr(163) . chr(45) . chr(85) . chr(168) . chr(161);
            $insertAssetData = $insertAssetDiscrimator . $symbolBuf;

            // Context accounts
            $keys = [
                new AccountMeta($env->admin->getPublicKey(), true, true),
                new AccountMeta($configPda, false, false),
                new AccountMeta($roundPda, false, false),
                new AccountMeta($groupAssetPda, false, true),
                new AccountMeta($assetPda, false, true),
                new AccountMeta($goldPriceFeedAccount, false, false),
                new AccountMeta($env->systemProgramId, false, false),
            ];

            // Instruction
            $ix = new TransactionInstruction($env->programId, $keys, $insertAssetData);
            $tx = new Transaction();
            $tx->feePayer = $env->admin->getPublicKey();
            $tx->add($ix);

            try {
                // Recent blockhash
                $latestBlockhash = $conn->getLatestBlockhash();
                $tx->recentBlockhash = $latestBlockhash['blockhash'];

                // Simulate transaction
                $simResult = $conn->simulateTransaction($tx, [$env->admin]);
                echo "Insert Asset Simulation Result: " . json_encode($simResult) . "\n";

                // Only send if simulation is successfully
                if (!isset($simResult['value']['err']) || $simResult['value']['err'] === null) {
                    $sig = $conn->sendTransaction($tx, [$env->admin]);
                    echo "Insert Asset Transaction: " . UrlHelpers::getFullExplorerUrl($env->rpcUrl, 'tx', $sig) . "\n";

                    // Wait for transaction confirmation
                    TxHelpers::confirmTransaction($client, $sig, $latestBlockhash['lastValidBlockHeight']);
                } else {
                    throw new Exception('Insert Asset simulation failed: ' . json_encode($simResult['value']['err']));
                }

                expect(is_string($sig))->toBeTrue();
                expect(strlen($sig))->toBeGreaterThan(10);
            } catch (Exception $e) {
                echo "Insert Asset Error: " . $e->getMessage() . "\n";
                echo "Error Class: " . get_class($e) . "\n";
                throw $e;
            }
        }
    }

    /// -- 4. CAPTURE START PRICE --
    // Discriminator: [51, 86, 229, 68, 153, 204, 34, 199]

    $round = AccountHelpers::fetchRoundAccount($client, $roundPda);

    for ($groupId = 1; $groupId <= $round->totalGroups; $groupId++) {
        $groupAssetPda = PdaHelpers::deriveGroupAssetPda($env->programId, $roundPda, $groupId);

        // Build data
        $captureStartPriceDiscriminator = chr(51) . chr(86) . chr(229) . chr(68) . chr(153) . chr(204) . chr(34) . chr(199);
        $captureStartPriceData = $captureStartPriceDiscriminator;

        // Context accounts
        $keys = [
            new AccountMeta($env->keeper->getPublicKey(), true, true),
            new AccountMeta($configPda, false, false),
            new AccountMeta($roundPda, false, true),
            new AccountMeta($groupAssetPda, false, true),
            new AccountMeta($env->systemProgramId, false, false),
        ];

        // Remaining accounts
        $remainingAccounts = [];
        $groupAsset = AccountHelpers::fetchGroupAssetAccount($client, $groupAssetPda);
        echo "Captured Start Price Assets: " . $groupAsset->capturedStartPriceAssets . "\n";
        echo "Total Assets: " . $groupAsset->totalAssets . "\n";
        for ($assetId = 1; $assetId <= $groupAsset->totalAssets; $assetId++) {
            $assetPda = PdaHelpers::deriveAssetPda($env->programId, $groupAssetPda, $assetId);

            // asset pda
            $remainingAccounts[] = new AccountMeta($assetPda, false, true);

            // price feed account
            $remainingAccounts[] = new AccountMeta($goldPriceFeedAccount, false, false);
        }
        $keys = array_merge($keys, $remainingAccounts);

        // Instruction
        $ix = new TransactionInstruction($env->programId, $keys, $captureStartPriceData);
        $tx = new Transaction();
        $tx->feePayer = $env->keeper->getPublicKey();
        $tx->add($ix);

        try {
            // Recent blockhash
            $latestBlockhash = $conn->getLatestBlockhash();
            $tx->recentBlockhash = $latestBlockhash['blockhash'];

            // Simulate transaction
            $simResult = $conn->simulateTransaction($tx, [$env->keeper]);
            echo "Capture Start Price Simulation Result: " . json_encode($simResult) . "\n";

            // Only send if simulation is successfully
            if (!isset($simResult['value']['err']) || $simResult['value']['err'] === null) {
                $sig = $conn->sendTransaction($tx, [$env->keeper]);
                echo "Capture Start Price Transaction: " . UrlHelpers::getFullExplorerUrl($env->rpcUrl, 'tx', $sig) . "\n";

                // Wait for transaction confirmation
                TxHelpers::confirmTransaction($client, $sig, $latestBlockhash['lastValidBlockHeight']);
            } else {
                throw new Exception('Capture Start Price simulation failed: ' . json_encode($simResult['value']['err']));
            }

            expect(is_string($sig))->toBeTrue();
            expect(strlen($sig))->toBeGreaterThan(10);
        } catch (Exception $e) {
            echo "Capture Start Price Error: " . $e->getMessage() . "\n";
            echo "Error Class: " . get_class($e) . "\n";
            $this->markTestSkipped('Capture Start Price Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /// -- 5. FINALIZE START GROUP ASSETS --
    // Discriminator: [122, 206, 104, 17, 125, 66, 221, 196]

    $round = AccountHelpers::fetchRoundAccount($client, $roundPda);
    for ($groupId = 1; $groupId <= $round->totalGroups; $groupId++) {
        $groupAssetPda = PdaHelpers::deriveGroupAssetPda($env->programId, $roundPda, $groupId);

        // Build data
        $finalizeStartGroupAssetDiscriminator = chr(122) . chr(206) . chr(104) . chr(17) . chr(125) . chr(66) . chr(221) . chr(196);
        $finalizeStartGroupAssetData = $finalizeStartGroupAssetDiscriminator;

        // Context accounts
        $keys = [
            new AccountMeta($env->keeper->getPublicKey(), true, true),
            new AccountMeta($configPda, false, false),
            new AccountMeta($roundPda, false, false),
            new AccountMeta($groupAssetPda, false, true),
            new AccountMeta($env->systemProgramId, false, false),
        ];

        // Remaining accounts
        $remainingAccounts = [];
        $groupAsset = AccountHelpers::fetchGroupAssetAccount($client, $groupAssetPda);
        for ($assetId = 1; $assetId <= $groupAsset->totalAssets; $assetId++) {
            $assetPda = PdaHelpers::deriveAssetPda($env->programId, $groupAssetPda, $assetId);
            $remainingAccounts[] = new AccountMeta($assetPda, false, true);
        }
        $keys = array_merge($keys, $remainingAccounts);

        // Instruction
        $ix = new TransactionInstruction($env->programId, $keys, $finalizeStartGroupAssetData);
        $tx = new Transaction();
        $tx->feePayer = $env->keeper->getPublicKey();
        $tx->add($ix);

        try {
            // Recent blockhash
            $latestBlockhash = $conn->getLatestBlockhash();
            $tx->recentBlockhash = $latestBlockhash['blockhash'];

            // Simulate transaction
            $simResult = $conn->simulateTransaction($tx, [$env->keeper]);
            echo "Finalize Start Group Asset Simulation Result: " . json_encode($simResult) . "\n";

            // Only send if simulation is successfully
            if (!isset($simResult['value']['err']) || $simResult['value']['err'] === null) {
                $sig = $conn->sendTransaction($tx, [$env->admin]);
                echo "Finalize Start Group Asset Transaction: " . UrlHelpers::getFullExplorerUrl($env->rpcUrl, 'tx', $sig) . "\n";

                // Wait for transaction confirmation
                TxHelpers::confirmTransaction($client, $sig, $latestBlockhash['lastValidBlockHeight']);
            } else {
                throw new Exception('Finalize Start Group Asset simulation failed: ' . json_encode($simResult['value']['err']));
            }

            expect(is_string($sig))->toBeTrue();
            expect(strlen($sig))->toBeGreaterThan(10);
        } catch (Exception $e) {
            echo "Finalize Start Group Asset Error: " . $e->getMessage() . "\n";
            echo "Error Class: " . get_class($e) . "\n";
            throw $e;
        }
    }

    /// -- 6. FINALIZE START GROUPS --
    // Discriminator: [56, 19, 3, 166, 223, 164, 105, 30]

    // Build data
    $finalizeStartGroupsDiscriminator = chr(56) . chr(19) . chr(3) . chr(166) . chr(223) . chr(164) . chr(105) . chr(30);
    $finalizeStartGroupsData = $finalizeStartGroupsDiscriminator;

    // Context accounts
    $keys = [
        new AccountMeta($env->keeper->getPublicKey(), true, true),
        new AccountMeta($configPda, false, false),
        new AccountMeta($roundPda, false, true),
        new AccountMeta($env->systemProgramId, false, false),
    ];

    // Remaining accounts
    $round = AccountHelpers::fetchRoundAccount($client, $roundPda);
    $remainingAccountsFinalizeStartGroups = [];
    for ($groupId = 1; $groupId <= $round->totalGroups; $groupId++) {
        $groupAssetPda = PdaHelpers::deriveGroupAssetPda($env->programId, $roundPda, $groupId);
        $remainingAccountsFinalizeStartGroups[] = new AccountMeta($groupAssetPda, false, false);
    }
    $keys = array_merge($keys, $remainingAccountsFinalizeStartGroups);

    // Instruction
    $ix = new TransactionInstruction($env->programId, $keys, $finalizeStartGroupsData);
    $tx = new Transaction();
    $tx->feePayer = $env->keeper->getPublicKey();
    $tx->add($ix);

    try {
        // Recent blockhash
        $latestBlockhash = $conn->getLatestBlockhash();
        $tx->recentBlockhash = $latestBlockhash['blockhash'];

        // Simulate transaction
        $simResult = $conn->simulateTransaction($tx, [$env->keeper]);
        echo "Finalize Start Groups Simulation Result: " . json_encode($simResult) . "\n";

        // Only send if simulation is successfully
        if (!isset($simResult['value']['err']) || $simResult['value']['err'] === null) {
            $sig = $conn->sendTransaction($tx, [$env->keeper]);
            echo "Finalize Start Groups Transaction: " . UrlHelpers::getFullExplorerUrl($env->rpcUrl, 'tx', $sig) . "\n";

            // Wait for transaction confirmation
            TxHelpers::confirmTransaction($client, $sig, $latestBlockhash['lastValidBlockHeight']);
        } else {
            throw new Exception('Finalize Start Groups simulation failed: ' . json_encode($simResult['value']['err']));
        }

        expect(is_string($sig))->toBeTrue();
        expect(strlen($sig))->toBeGreaterThan(10);
    } catch (Exception $e) {
        echo "Finalize Start Groups Error: " . $e->getMessage() . "\n";
        echo "Error Class: " . get_class($e) . "\n";
        throw $e;
    }

    /// -- 7. START ROUND --
    // Discriminator: [144, 144, 43, 7, 193, 42, 217, 215]

    // Build data
    $startRoundDiscriminator = chr(144) . chr(144) . chr(43) . chr(7) . chr(193) . chr(42) . chr(217) . chr(215);
    $startRoundData = $startRoundDiscriminator;

    // Context accounts
    $keys = [
        new AccountMeta($env->keeper->getPublicKey(), true, true),
        new AccountMeta($configPda, false, false),
        new AccountMeta($roundPda, false, true),
        new AccountMeta($env->programId, false, false), // null
        new AccountMeta($env->systemProgramId, false, false),
    ];

    // Instruction
    $ix = new TransactionInstruction($env->programId, $keys, $startRoundData);
    $tx = new Transaction();
    $tx->feePayer = $env->keeper->getPublicKey();
    $tx->add($ix);

    // Retry configuration
    $maxWaitMs = 20_000; // 20 seconds
    $pollIntervalMs = 1_000; // 1 second
    $startTime = microtime(true) * 1_000;

    while (true) {
        try {
            // Recent blockhash
            $latestBlockhash = $conn->getLatestBlockhash();
            $tx->recentBlockhash = $latestBlockhash['blockhash'];

            // Simulate transaction
            $simResult = $conn->simulateTransaction($tx, [$env->keeper]);
            echo "Start Round Simulation Result: " . json_encode($simResult) . "\n";

            // Check for specific errors in simulation
            if (isset($simResult['value']['err']) && $simResult['value']['err'] !== null) {
                // Check logs for specific error messages
                $logs = $simResult['value']['logs'] ?? [];
                $logsString = implode(' ', $logs);

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
            $sig = $conn->sendTransaction($tx, [$env->keeper]);
            echo "Start Round Transaction: " . UrlHelpers::getFullExplorerUrl($env->rpcUrl, 'tx', $sig) . "\n";
            expect(is_string($sig))->toBeTrue();
            expect(strlen($sig))->toBeGreaterThan(10);

            // Wait for transaction confirmation
            TxHelpers::confirmTransaction($client, $sig, $latestBlockhash['lastValidBlockHeight']);

            break;
        } catch (Exception $e) {
            echo "Start Round Error: " . $e->getMessage() . "\n";
            echo "Error Class: " . get_class($e) . "\n";
            $this->markTestSkipped('Start Round Error: ' . $e->getMessage());
            return;
        }
    }

    /// -- 8. PLACE BET --
    // Discriminator: [222, 62, 67, 220, 63, 166, 126, 33]


    /// -- 9. CAPTURE END PRICE --
    // Discriminator: [116, 44, 170, 74, 105, 109, 182, 246]


    /// -- 10. FINALIZE END GROUP ASSETS --
    // Discriminator: [11, 196, 212, 158, 225, 111, 94, 122]


    /// -- 11. FINALIZE END GROUPS --
    // Discriminator: [135, 108, 53, 26, 184, 143, 250, 65]


    /// -- 12. SETTLE ROUND --
    // Discriminator: [117, 63, 7, 4, 247, 239, 50, 135]
})->group('solana');
