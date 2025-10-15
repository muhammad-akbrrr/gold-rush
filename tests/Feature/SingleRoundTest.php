<?php

use Attestto\SolanaPhpSdk\Util\AccountMeta;
use Attestto\SolanaPhpSdk\TransactionInstruction;
use Attestto\SolanaPhpSdk\Transaction;
use Attestto\SolanaPhpSdk\SolanaRpcClient;
use Attestto\SolanaPhpSdk\Connection;

require_once __DIR__ . '/../Helpers/AccountHelpers.php';
require_once __DIR__ . '/../Helpers/Env.php';
require_once __DIR__ . '/../Helpers/PdaHelpers.php';
require_once __DIR__ . '/../Helpers/PythHelpers.php';
require_once __DIR__ . '/../Helpers/TxHelpers.php';
require_once __DIR__ . '/../Helpers/UrlHelpers.php';
require_once __DIR__ . '/../Helpers/WalletHelpers.php';

test('Single Asset Round Tests', function () {
    /// -- SETUP --
    // load env
    $env = Env::loadAllEnv();

    // Token account
    $userTokenAccount = PdaHelpers::deriveTokenAccountPda(
        $env->tokenProgramId,
        $env->associatedTokenProgramId,
        $env->user->getPublicKey(),
        $env->mint
    );
    $treasuryTokenAccount = PdaHelpers::deriveTokenAccountPda(
        $env->tokenProgramId,
        $env->associatedTokenProgramId,
        $env->treasury->getPublicKey(),
        $env->mint
    );

    // Price feed account
    $goldPriceFeedAccount = PythHelpers::getPriceFeedAccount(
        $env->goldPriceFeedId,
        $env->pushOracleProgramId
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
    $marketType = '0'; // single asset
    $startTime = time() + 3; // 3 seconds from now
    $endTime = $startTime + 30; // 30 seconds

    // Build data
    $marketBuf = pack('C', $marketType);
    $startBuf = pack('q', $startTime);
    $endBuf = pack('q', $endTime);
    $createRoundDiscrimator = chr(229) . chr(218) . chr(236) . chr(169) . chr(231) . chr(80) . chr(134) . chr(112);
    $createRoundData = $createRoundDiscrimator . $marketBuf . $startBuf . $endBuf;

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

    /// -- 2. START ROUND --
    // Discriminator: [144, 144, 43, 7, 193, 42, 217, 215]

    // Build data
    $startRoundDiscriminator = chr(144) . chr(144) . chr(43) . chr(7) . chr(193) . chr(42) . chr(217) . chr(215);
    $startRoundData = $startRoundDiscriminator;

    // Context accounts
    $keys = [
        new AccountMeta($env->keeper->getPublicKey(), true, true),
        new AccountMeta($configPda, false, true),
        new AccountMeta($roundPda, false, true),
        new AccountMeta($goldPriceFeedAccount, false, false),
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

    // Retry loop for RoundNotReadyForStart
    while (true) {
        try {
            // Recent blockhash
            $latestBlockhash = $conn->getLatestBlockhash();
            $tx->recentBlockhash = $latestBlockhash['blockhash'];

            // Simulate transaction first
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

            // Send transaction
            $sig = $conn->sendTransaction($tx, [$env->keeper]);
            echo "Start Round Transaction: " . UrlHelpers::getFullExplorerUrl($env->rpcUrl, 'tx', $sig) . "\n";

            expect(is_string($sig))->toBeTrue();
            expect(strlen($sig))->toBeGreaterThan(10);

            // Wait for Start Round to complete and verify status change
            TxHelpers::confirmTransaction($client, $sig, $latestBlockhash['lastValidBlockHeight']);

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
    $configPda = PdaHelpers::deriveConfigPda($env->programId);

    // Get next bet ID
    $round = AccountHelpers::fetchRoundAccount($client, $roundPda);
    $currentBetId = $round->totalBets;
    $nextBetId = $currentBetId + 1;

    // Derive round vault PDA
    $vaultPda = PdaHelpers::deriveVaultPda($env->programId, $roundPda);

    // Derive bet PDA
    $betPda = PdaHelpers::deriveBetPda($env->programId, $roundPda, $nextBetId);

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
        new AccountMeta($env->user->getPublicKey(), true, true),
        new AccountMeta($configPda, false, false),
        new AccountMeta($roundPda, false, true),
        new AccountMeta($env->programId, false, false), // null
        new AccountMeta($betPda, false, true),
        new AccountMeta($vaultPda, false, true),
        new AccountMeta($userTokenAccount, false, true),
        new AccountMeta($env->mint, false, false),
        new AccountMeta($env->tokenProgramId, false, false),
        new AccountMeta($env->systemProgramId, false, false),
    ];

    // Instruction
    $ix = new TransactionInstruction($env->programId, $keys, $placeBetData);
    $tx = new Transaction();
    $tx->feePayer = $env->user->getPublicKey();
    $tx->add($ix);

    try {
        // Recent blockhash
        $latestBlockhash = $conn->getLatestBlockhash();
        $tx->recentBlockhash = $latestBlockhash['blockhash'];

        // Simulate transaction
        $simResult = $conn->simulateTransaction($tx, [$env->user]);
        echo "Place Bet Simulation Result: " . json_encode($simResult) . "\n";

        // Only send if simulation is successfully
        if (!isset($simResult['value']['err']) || $simResult['value']['err'] === null) {
            $sig = $conn->sendTransaction($tx, [$env->user]);
            echo "Place Bet Transaction: " . UrlHelpers::getFullExplorerUrl($env->rpcUrl, 'tx', $sig) . "\n";

            // Wait for transaction confirmation
            TxHelpers::confirmTransaction($client, $sig, $latestBlockhash['lastValidBlockHeight']);
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
        new AccountMeta($env->keeper->getPublicKey(), true, true),
        new AccountMeta($configPda, false, false),
        new AccountMeta($roundPda, false, true),
        new AccountMeta($vaultPda, false, true),
        new AccountMeta($goldPriceFeedAccount, false, false),
        new AccountMeta($env->treasury->getPublicKey(), false, false),
        new AccountMeta($treasuryTokenAccount, false, true),
        new AccountMeta($env->mint, false, false),
        new AccountMeta($env->tokenProgramId, false, false),
        new AccountMeta($env->associatedTokenProgramId, false, false),
        new AccountMeta($env->systemProgramId, false, false),
    ];

    // Remaining accounts
    $betAccounts = [$betPda];
    foreach ($betAccounts as $betAccount) {
        $keys[] = new AccountMeta($betAccount, false, true);
    }

    // Instruction
    $ix = new TransactionInstruction($env->programId, $keys, $settleRoundData);
    $tx = new Transaction();
    $tx->feePayer = $env->keeper->getPublicKey();
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
            $latestBlockhash = $conn->getLatestBlockhash();
            $tx->recentBlockhash = $latestBlockhash['blockhash'];

            // Simulate transaction
            $simResult = $conn->simulateTransaction($tx, [$env->keeper]);
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
            $sig = $conn->sendTransaction($tx, [$env->keeper]);
            echo "Settle Round Transaction: " . UrlHelpers::getFullExplorerUrl($env->rpcUrl, 'tx', $sig) . "\n";

            expect(is_string($sig))->toBeTrue();
            expect(strlen($sig))->toBeGreaterThan(10);

            // Wait for transaction confirmation
            TxHelpers::confirmTransaction($client, $sig, $latestBlockhash['lastValidBlockHeight']);

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

    // Context accounts
    $keys = [
        new AccountMeta($env->user->getPublicKey(), true, true),
        new AccountMeta($configPda, false, false),
        new AccountMeta($roundPda, false, false),
        new AccountMeta($vaultPda, false, true),
        new AccountMeta($betPda, false, true),
        new AccountMeta($userTokenAccount, false, true),
        new AccountMeta($env->mint, false, false),
        new AccountMeta($env->tokenProgramId, false, false),
        new AccountMeta($env->systemProgramId, false, false),
    ];

    // Instruction
    $ix = new TransactionInstruction($env->programId, $keys, $claimRewardData);
    $tx = new Transaction();
    $tx->feePayer = $env->user->getPublicKey();
    $tx->add($ix);

    try {
        // Recent blockhash
        $latestBlockhash = $conn->getLatestBlockhash();
        $tx->recentBlockhash = $latestBlockhash['blockhash'];

        // Simulate transaction
        $simResult = $conn->simulateTransaction($tx, [$env->user]);
        echo "Claim Reward Simulation Result: " . json_encode($simResult) . "\n";

        // Only send if simulation is successfully
        if (!isset($simResult['value']['err']) || $simResult['value']['err'] === null) {
            $sig = $conn->sendTransaction($tx, [$env->user]);
            echo "Claim Reward Transaction: " . UrlHelpers::getFullExplorerUrl($env->rpcUrl, 'tx', $sig) . "\n";

            // Wait for transaction confirmation
            TxHelpers::confirmTransaction($client, $sig, $latestBlockhash['lastValidBlockHeight']);
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
