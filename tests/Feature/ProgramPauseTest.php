<?php

use Attestto\SolanaPhpSdk\SolanaRpcClient;
use Attestto\SolanaPhpSdk\Transaction;
use Attestto\SolanaPhpSdk\TransactionInstruction;
use Attestto\SolanaPhpSdk\Util\AccountMeta;
use Attestto\SolanaPhpSdk\Connection;
use Attestto\SolanaPhpSdk\PublicKey;
use Attestto\SolanaPhpSdk\Keypair;

require_once __DIR__ . '/../Helpers/AccountHelpers.php';
require_once __DIR__ . '/../Helpers/EnvHelpers.php';

describe('Program Pause', function () {
    beforeEach(function () {
        // load env
        $this->env = EnvHelpers::loadAllEnv();

        // create client
        $this->client = new SolanaRpcClient($this->env->rpcUrl);
        $this->conn = new Connection($this->client);
        $this->configPda = PdaHelpers::deriveConfigPda($this->env->programId);

        // ensure program initialized
        ensureProgramInitialized($this->client, $this->configPda, $this->env);
    });

    test('happy path', function () {
        // Arrange - ensure program unpaused
        $config = AccountHelpers::fetchConfigAccount($this->client, $this->configPda);
        if ($config->status != 0) { // 0 is active
            programUnpause($this->client, $this->conn, $this->configPda, $this->env);
        }

        // Act - pause program
        $sig = programPause($this->client, $this->conn, $this->configPda, $this->env, $this->env->admin);

        // Assert - verify program is paused
        $config = AccountHelpers::fetchConfigAccount($this->client, $this->configPda);
        expect($config->status)->toBe(1); // 1 is paused
    });

    test('fails when program already paused', function () {
        // Arrange - ensure program paused
        $config = AccountHelpers::fetchConfigAccount($this->client, $this->configPda);
        if ($config->status != 1) { // 1 is paused
            programPause($this->client, $this->conn, $this->configPda, $this->env, $this->env->admin);
        }

        // Act & Assert
        expect(fn() => programPause($this->client, $this->conn, $this->configPda, $this->env, $this->env->user))
            ->toThrow(Exception::class, 'AlreadyPaused');
    });

    test('fails when non-admin tries to pause', function () {
        // Arrange - ensure program unpaused
        $config = AccountHelpers::fetchConfigAccount($this->client, $this->configPda);
        if ($config->status != 0) { // 0 is active
            programUnpause($this->client, $this->conn, $this->configPda, $this->env);
        }

        // Act & Assert
        expect(fn() => programPause($this->client, $this->conn, $this->configPda, $this->env, $this->env->user))
            ->toThrow(Exception::class, 'Unauthorized');
    });

    test('fails create round when program paused', function () {
        // Arrange - ensure program paused
        $config = AccountHelpers::fetchConfigAccount($this->client, $this->configPda);
        if ($config->status != 1) { // 1 is paused
            programPause($this->client, $this->conn, $this->configPda, $this->env, $this->env->admin);
        }

        // Act & Assert
        expect(fn() => createRound($this->client, $this->conn, $this->configPda, $this->env))
            ->toThrow(Exception::class, 'ProgramPaused');
    });
})->group('solana', 'program-pause');

function ensureProgramInitialized(SolanaRpcClient $client, PublicKey $configPda)
{
    try {
        AccountHelpers::fetchConfigAccount($client, $configPda);
    } catch (Exception $e) {
        throw new Exception('Program not initialized');
    }
}

function programPause(SolanaRpcClient $client, Connection $conn, PublicKey $configPda, object $env, Keypair $signer)
{
    // Build data
    $programPauseDscriminator = chr(181) . chr(208) . chr(170) . chr(190) . chr(72) . chr(195) . chr(230) . chr(153);
    $programPauseData = $programPauseDscriminator;

    // Context account
    $keys = [
        new AccountMeta($signer->getPublicKey(), false, true),
        new AccountMeta($configPda, false, true),
    ];

    // Instruction
    $ix = new TransactionInstruction($env->programId, $keys, $programPauseData);
    $tx = new Transaction();
    $tx->feePayer = $signer->getPublicKey();
    $tx->add($ix);


    // Recent blockhash
    $latestBlockhash = $conn->getLatestBlockhash();
    $tx->recentBlockhash = $latestBlockhash['blockhash'];

    // Simulate transaction
    $simResult = $conn->simulateTransaction($tx, [$signer]);
    if (isset($simResult['value']['err']) && $simResult['value']['err'] !== null) {
        handleSimulationError($simResult);
    }

    $sig = $conn->sendTransaction($tx, [$signer]);
    echo "Pause Program Transaction: " . UrlHelpers::getFullExplorerUrl($env->rpcUrl, 'tx', $sig) . "\n";

    // Wait for transaction confirmation
    TxHelpers::confirmTransaction($client, $sig, $latestBlockhash['lastValidBlockHeight']);

    return $sig;
}

function programUnpause(SolanaRpcClient $client, Connection $conn, PublicKey $configPda, object $env)
{
    // Build data
    $programUnpauseDscriminator = chr(40) . chr(67) . chr(64) . chr(22) . chr(106) . chr(172) . chr(128) . chr(185);
    $programUnpauseData = $programUnpauseDscriminator;

    // Context account
    $keys = [
        new AccountMeta($env->admin->getPublicKey(), false, true),
        new AccountMeta($configPda, false, true),
    ];

    // Instruction
    $ix = new TransactionInstruction($env->programId, $keys, $programUnpauseData);
    $tx = new Transaction();
    $tx->feePayer = $env->admin->getPublicKey();
    $tx->add($ix);

    // Recent blockhash
    $latestBlockhash = $conn->getLatestBlockhash();
    $tx->recentBlockhash = $latestBlockhash['blockhash'];

    // Simulate transaction
    $simResult = $conn->simulateTransaction($tx, [$env->admin]);
    if (isset($simResult['value']['err']) && $simResult['value']['err'] !== null) {
        handleSimulationError($simResult);
    }

    $sig = $conn->sendTransaction($tx, [$env->admin]);
    echo "Unpause Program Transaction: " . UrlHelpers::getFullExplorerUrl($env->rpcUrl, 'tx', $sig) . "\n";

    // Wait for transaction confirmation
    TxHelpers::confirmTransaction($client, $sig, $latestBlockhash['lastValidBlockHeight']);

    return $sig;
}

function createRound(SolanaRpcClient $client, Connection $conn, PublicKey $configPda, object $env)
{
    // Get next round ID
    $config = AccountHelpers::fetchConfigAccount($client, $configPda);
    $currentRoundId = $config->currentRoundCounter;
    $nextRoundId = $currentRoundId + 1;

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

    // Recent blockhash
    $latestBlockhash = $conn->getLatestBlockhash();
    $tx->recentBlockhash = $latestBlockhash['blockhash'];

    // Simulate transaction
    $simResult = $conn->simulateTransaction($tx, [$env->admin]);
    if (isset($simResult['value']['err']) && $simResult['value']['err'] !== null) {
        handleSimulationError($simResult);
    }

    $sig = $conn->sendTransaction($tx, [$env->admin]);
    TxHelpers::confirmTransaction($client, $sig, $latestBlockhash['lastValidBlockHeight']);

    return $sig;
}
function handleSimulationError(array $simResult)
{
    $logs = $simResult['value']['logs'] ?? [];
    $logsString = implode(' ', $logs);

    // Parse specific error types
    if (strpos($logsString, 'AlreadyPaused') !== false) {
        throw new Exception('AlreadyPaused');
    }
    if (strpos($logsString, 'Unauthorized') !== false) {
        throw new Exception('Unauthorized');
    }
    if (strpos($logsString, 'ProgramPaused') !== false) {
        throw new Exception('ProgramPaused');
    }

    throw new Exception('Simulation failed: ' . json_encode($simResult['value']['err']));
}
