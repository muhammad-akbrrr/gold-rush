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
        '0',
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
    $config = AccountHelpers::fetchConfigAccount($conn, $configPda);
    $currentRoundId = $config->currentRoundCounter;
    $nextRoundId = $currentRoundId + 1;

    // Debug current round info
    echo "Current Round ID: " . $currentRoundId . "\n";
    echo "Next Round ID: " . $nextRoundId . "\n";

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
        $recentBlockhash = $conn->getRecentBlockhash();
        $tx->recentBlockhash = $recentBlockhash['blockhash'];

        // Simulate transaction
        $simResult = $conn->simulateTransaction($tx, [$env->admin]);
        echo "Create Round Simulation Result: " . json_encode($simResult) . "\n";

        // Only send if simulation is successfully
        if (!isset($simResult['value']['err']) || $simResult['value']['err'] === null) {
            $sig = $conn->sendTransaction($tx, [$env->admin]);
            echo "Create Round Transaction: " . $env->rpcUrl . '?sig=' . $sig . "\n";

            // Wait for transaction confirmation
            sleep(10);
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

    $groupId = 1;

    // Derive group asset PDA
    $groupAssetPda = PdaHelpers::deriveGroupAssetPda($env->programId, $roundPda, $groupId);

    // Arguments
    $symbol = BytesHelpers::stringToBytes("ASA " . $groupId);

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
        $recentBlockhash = $conn->getRecentBlockhash();
        $tx->recentBlockhash = $recentBlockhash['blockhash'];

        // Simulate transaction
        $simResult = $conn->simulateTransaction($tx, [$env->admin]);
        echo "Insert Group Asset Simulation Result: " . json_encode($simResult) . "\n";

        // Only send if simulation is successfully
        if (!isset($simResult['value']['err']) || $simResult['value']['err'] === null) {
            $sig = $conn->sendTransaction($tx, [$env->admin]);
            echo "Insert Group Asset Transaction: " . $env->rpcUrl . '?sig=' . $sig . "\n";

            // wait for transaction confirmation
            sleep(10);
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

    /// -- 3. INSERT ASSET --
    // Discriminator: [190, 133, 160, 163, 45, 85, 168, 161]

    $assetId = 1;

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
        $recentBlockhash = $conn->getRecentBlockhash();
        $tx->recentBlockhash = $recentBlockhash['blockhash'];

        // Simulate transaction
        $simResult = $conn->simulateTransaction($tx, [$env->admin]);
        echo "Insert Asset Simulation Result: " . json_encode($simResult) . "\n";

        // Only send if simulation is successfully
        if (!isset($simResult['value']['err']) || $simResult['value']['err'] === null) {
            $sig = $conn->sendTransaction($tx, [$env->admin]);
            echo "Insert Asset Transaction: " . $env->rpcUrl . '?sig=' . $sig . "\n";
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

    /// -- 4. CAPTURE START PRICE --
    // Discriminator: [51, 86, 229, 68, 153, 204, 34, 199]

    /// -- 5. FINALIZE START GROUP ASSETS --
    // Discriminator: [122, 206, 104, 17, 125, 66, 221, 196]

    /// -- 6. FINALIZE START GROUPS --
    // Discriminator: [56, 19, 3, 166, 223, 164, 105, 30]

    /// -- 7. START ROUND --
    // Discriminator: [144, 144, 43, 7, 193, 42, 217, 215]

    // Build data
    $startRoundDiscriminator = chr(144) . chr(144) . chr(43) . chr(7) . chr(193) . chr(42) . chr(217) . chr(215);
    $startRoundData = $startRoundDiscriminator;

    // Context accounts

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
});
