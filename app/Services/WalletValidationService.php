<?php

namespace App\Services;

use App\Contracts\WalletValidationServiceInterface;
use App\Exceptions\InvalidWalletAddressException;
use Illuminate\Support\Facades\Log;

class WalletValidationService implements WalletValidationServiceInterface
{
  /**
   * Validate Solana wallet address format
   */
  public function validateSolanaAddress(string $address): bool
  {
    // Basic Solana address validation (base58, 32-44 characters)
    return preg_match('/^[1-9A-HJ-NP-Za-km-z]{32,44}$/', $address);
  }

  /**
   * Validate wallet address with detailed error information
   */
  public function validateAddressWithDetails(string $address): array
  {
    $result = [
      'is_valid' => false,
      'errors' => [],
      'warnings' => [],
    ];

    // Check if address is empty
    if (empty($address)) {
      $result['errors'][] = 'Wallet address cannot be empty.';
      return $result;
    }

    // Check length
    $length = strlen($address);
    if ($length < 32) {
      $result['errors'][] = 'Wallet address is too short. Solana addresses must be at least 32 characters.';
    } elseif ($length > 44) {
      $result['errors'][] = 'Wallet address is too long. Solana addresses must be at most 44 characters.';
    }

    // Check character set
    if (!preg_match('/^[1-9A-HJ-NP-Za-km-z]+$/', $address)) {
      $result['errors'][] = 'Wallet address contains invalid characters. Only base58 characters are allowed.';
    }

    // Check for common patterns that might indicate invalid addresses
    if (preg_match('/^0+$/', $address)) {
      $result['errors'][] = 'Wallet address cannot be all zeros.';
    }

    // Check for suspicious patterns
    if (preg_match('/(.)\1{10,}/', $address)) {
      $result['warnings'][] = 'Wallet address contains repeated characters which may indicate an invalid address.';
    }

    // If no errors, address is valid
    if (empty($result['errors'])) {
      $result['is_valid'] = true;
    }

    return $result;
  }

  /**
   * Sanitize wallet address
   */
  public function sanitizeAddress(string $address): string
  {
    // Remove whitespace
    $address = trim($address);

    // Remove any non-base58 characters
    $address = preg_replace('/[^1-9A-HJ-NP-Za-km-z]/', '', $address);

    return $address;
  }

  /**
   * Check if address is a known test address
   */
  public function isTestAddress(string $address): bool
  {
    // Common test addresses (you can expand this list)
    $testAddresses = [
      '11111111111111111111111111111111', // System Program
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', // Token Program
      'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL', // Associated Token Account Program
    ];

    return in_array($address, $testAddresses);
  }

  /**
   * Validate multiple addresses
   */
  public function validateMultipleAddresses(array $addresses): array
  {
    $results = [];

    foreach ($addresses as $address) {
      $results[$address] = $this->validateAddressWithDetails($address);
    }

    return $results;
  }

  /**
   * Get address type (if possible to determine)
   */
  public function getAddressType(string $address): string
  {
    if (!$this->validateSolanaAddress($address)) {
      return 'invalid';
    }

    if ($this->isTestAddress($address)) {
      return 'test';
    }

    // You can add more logic here to determine address types
    // For example, checking if it's a program address, etc.

    return 'user';
  }

  /**
   * Check if address is a program address
   */
  public function isProgramAddress(string $address): bool
  {
    // This is a simplified check. In a real implementation,
    // you would check against known program addresses
    $programAddresses = [
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
      '11111111111111111111111111111111',
      // Add more program addresses as needed
    ];

    return in_array($address, $programAddresses);
  }

  /**
   * Validate address for authentication purposes
   */
  public function validateForAuthentication(string $address): array
  {
    $validation = $this->validateAddressWithDetails($address);

    if (!$validation['is_valid']) {
      return [
        'can_authenticate' => false,
        'errors' => $validation['errors'],
        'warnings' => $validation['warnings'],
      ];
    }

    // Additional checks for authentication
    if ($this->isTestAddress($address)) {
      return [
        'can_authenticate' => false,
        'errors' => ['Test addresses cannot be used for authentication.'],
        'warnings' => $validation['warnings'],
      ];
    }

    if ($this->isProgramAddress($address)) {
      return [
        'can_authenticate' => false,
        'errors' => ['Program addresses cannot be used for authentication.'],
        'warnings' => $validation['warnings'],
      ];
    }

    return [
      'can_authenticate' => true,
      'errors' => [],
      'warnings' => $validation['warnings'],
    ];
  }

  /**
   * Log validation attempts for security monitoring
   */
  public function logValidationAttempt(string $address, bool $isValid, array $errors = []): void
  {
    Log::info('Wallet address validation attempt', [
      'address' => $address,
      'is_valid' => $isValid,
      'errors' => $errors,
      'ip_address' => request()->ip(),
      'user_agent' => request()->userAgent(),
    ]);
  }
}