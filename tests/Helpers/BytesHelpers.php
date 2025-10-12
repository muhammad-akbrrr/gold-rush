<?php

/**
 * Helpers function to manage bytes
 */
class BytesHelpers
{
    /**
     * Convert string to bytes
     */
    public static function stringToBytes(string $value): array
    {
        $valueBytes = unpack('C*', $value);
        $valueArray = array_fill(0, 8, 0);

        $length = min(count($valueBytes), 8);
        for ($i = 0; $i < $length; $i++) {
            $valueArray[$i] = $valueBytes[$i + 1];
        }

        return $valueArray;
    }

    /**
     * Convert bytes array to binary string
     */
    public static function arrayToString(array $bytes): string
    {
        return pack('C*', ...$bytes);
    }
}
