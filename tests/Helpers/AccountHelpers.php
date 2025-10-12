<?php

use Attestto\SolanaPhpSdk\PublicKey;
use Attestto\SolanaPhpSdk\Connection;

/**
 * Helpers functions to parse account from Solana
 */
class AccountHelpers
{
    /**
     * Fetch and parse confif account
     */
    public static function fetchConfigAccount(Connection $conn, PublicKey $configPda): object
    {
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
    }

    /**
     * Fetch and parse round account
     */
    public static function fetchRoundAccount(Connection $conn, PublicKey $roundPda): object
    {
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
    }
}
