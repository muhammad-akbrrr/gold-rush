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

    // Read from ENV
    $rpcUrl = $requireEnv('SOLANA_RPC_URL');
    $programId = $toPublicKey($requireEnv('PROGRAM_ID'));
    $systemProgramId = $toPublicKey($requireEnv('SYSTEM_PROGRAM_ID'));
    $tokenProgramId = $toPublicKey($requireEnv('TOKEN_PROGRAM_ID'));
    $mint = $toPublicKey($requireEnv('TOKEN_MINT'));
    $admin = $loadKeypairFromJsonFile($requireEnv('ADMIN_KEYPAIR_PATH'));
    $keeper = $loadKeypairFromJsonFile($requireEnv('KEEPER_KEYPAIR_PATH'));
    $user = $loadKeypairFromJsonFile($requireEnv('USER_KEYPAIR_PATH'));

    // Create connection
    $client = new SolanaRpcClient($rpcUrl);
    $conn = new Connection($client);

    /// -- 1. CREATE ROUND --

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

    $sig = $conn->sendTransaction($tx, [$admin]);

    expect(is_string($sig))->toBeTrue();
    expect(strlen($sig))->toBeGreaterThan(10);

    /// -- 2. START ROUND (loop until can start) --


    /// -- 3. PLACE BET --


    /// -- 4. SETTLE SINGLE ROUND (loop until can settle) --


    /// -- 5. CLAIM BET --
})->group('solana');
