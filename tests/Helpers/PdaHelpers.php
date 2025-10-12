<?php

use Attestto\SolanaPhpSdk\PublicKey;

/**
 * Helpers function to derive Solana PDAs
 */
class PdaHelpers
{
    /**
     * Derive config PDA
     */
    public static function deriveConfigPda(PublicKey $programId): PublicKey
    {
        return PublicKey::findProgramAddressSync(['config'], $programId)[0];
    }


    /**
     * Derive round PDA
     */
    public static function deriveRoundPda(PublicKey $programId, int $roundId): PublicKey
    {
        $low32 = $roundId & 0xFFFFFFFF;
        $high32 = ($roundId >> 32) & 0xFFFFFFFF;
        $roundIdSeed = pack('V2', $low32, $high32);

        return PublicKey::findProgramAddressSync(['round', $roundIdSeed], $programId)[0];
    }

    /**
     * Derive vault PDA
     */
    public static function deriveVaultPda(PublicKey $programId, PublicKey $roundPda): PublicKey
    {
        return PublicKey::findProgramAddressSync(['vault', $roundPda->toBinaryString()], $programId)[0];
    }

    /**
     * Derive group asset PDA
     */
    public static function deriveGroupAssetPda(PublicKey $programId, PublicKey $roundPda, int $groupId): PublicKey
    {
        $low32 = $groupId & 0xFFFFFFFF;
        $high32 = ($groupId >> 32) & 0xFFFFFFFF;
        $groupIdSeed = pack('V2', $low32, $high32);

        return PublicKey::findProgramAddressSync([
            'group_asset',
            $roundPda->toBinaryString(),
            $groupIdSeed
        ], $programId)[0];
    }

    /**
     * Derive asset pda
     */
    public static function deriveAssetPda(PublicKey $programId, PublicKey $groupAssetPda, int $assetId): PublicKey
    {
        $low32 = $assetId & 0xFFFFFFFF;
        $high32 = ($assetId >> 32) & 0xFFFFFFFF;
        $assetIdSeed = pack('V2', $low32, $high32);

        return PublicKey::findProgramAddressSync(['asset', $groupAssetPda->toBinaryString(), $assetIdSeed], $programId)[0];
    }

    /**
     * Derive bet PDA
     */
    public static function deriveBetPda(PublicKey $programId, PublicKey $roundPda, int $betId): PublicKey
    {
        $low32 = $betId & 0xFFFFFFFF;
        $high32 = ($betId >> 32) & 0xFFFFFFFF;
        $betIdSeed = pack('V2', $low32, $high32);

        return PublicKey::findProgramAddressSync(['bet', $roundPda->toBinaryString(), $betIdSeed], $programId)[0];
    }

    /**
     * Derive token account PDA
     */
    public static function deriveTokenAccountPda(PublicKey $tokenProgramId, PublicKey $associatedTokenProgramId, PublicKey $signer, PublicKey $mint): PublicKey
    {
        return PublicKey::findProgramAddressSync([
            $signer->toBinaryString(),
            $tokenProgramId->toBinaryString(),
            $mint->toBinaryString()
        ], $associatedTokenProgramId)[0];
    }
}
