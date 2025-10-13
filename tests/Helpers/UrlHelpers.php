<?php

/**
 * Helpers function to manage urls
 */
class UrlHelpers
{
    /**
     * Get full explorer url
     */
    public static function getFullExplorerUrl(string $rpcUrl, string $type, string $address): string
    {
        $baseUrl = "https://solscan.io";

        $url = $baseUrl . '/' . $type . '/' . $address;

        if (str_starts_with($rpcUrl, 'https://api.devnet.solana.com')) {
            $url .= "?cluster=devnet";
        }

        return $url;
    }
}
