<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class InvalidWalletAddressException extends Exception
{
    protected $walletAddress;
    protected $validationErrors;
    protected $context;

    public function __construct(
        string $walletAddress,
        array $validationErrors = [],
        array $context = [],
        ?Exception $previous = null
    ) {
        $message = "Invalid wallet address: {$walletAddress}";
        
        if (!empty($validationErrors)) {
            $message .= '. Errors: ' . implode(', ', $validationErrors);
        }
        
        parent::__construct($message, Response::HTTP_BAD_REQUEST, $previous);
        
        $this->walletAddress = $walletAddress;
        $this->validationErrors = $validationErrors;
        $this->context = $context;
    }

    /**
     * Create exception for invalid format
     */
    public static function invalidFormat(string $walletAddress, array $context = []): self
    {
        return new self(
            $walletAddress,
            ['Invalid Solana address format'],
            array_merge($context, ['reason' => 'invalid_format'])
        );
    }

    /**
     * Create exception for invalid length
     */
    public static function invalidLength(string $walletAddress, int $actualLength, int $expectedLength = 44): self
    {
        return new self(
            $walletAddress,
            ["Invalid address length: {$actualLength}, expected: {$expectedLength}"],
            [
                'reason' => 'invalid_length',
                'actual_length' => $actualLength,
                'expected_length' => $expectedLength,
            ]
        );
    }

    /**
     * Create exception for invalid characters
     */
    public static function invalidCharacters(string $walletAddress, array $invalidChars = []): self
    {
        $errors = ['Contains invalid characters for Solana address'];
        
        if (!empty($invalidChars)) {
            $errors[] = 'Invalid characters: ' . implode(', ', $invalidChars);
        }
        
        return new self(
            $walletAddress,
            $errors,
            [
                'reason' => 'invalid_characters',
                'invalid_characters' => $invalidChars,
            ]
        );
    }

    /**
     * Create exception for checksum failure
     */
    public static function checksumFailed(string $walletAddress): self
    {
        return new self(
            $walletAddress,
            ['Address checksum validation failed'],
            ['reason' => 'checksum_failed']
        );
    }

    /**
     * Create exception for empty or null address
     */
    public static function empty(): self
    {
        return new self(
            '',
            ['Wallet address cannot be empty'],
            ['reason' => 'empty_address']
        );
    }

    /**
     * Get the invalid wallet address
     */
    public function getWalletAddress(): string
    {
        return $this->walletAddress;
    }

    /**
     * Get validation errors
     */
    public function getValidationErrors(): array
    {
        return $this->validationErrors;
    }

    /**
     * Get the reason for validation failure
     */
    public function getValidationReason(): string
    {
        return $this->context['reason'] ?? 'unknown';
    }

    /**
     * Get additional context
     */
    public function getContext(): array
    {
        return $this->context;
    }

    /**
     * Check if the error is due to invalid format
     */
    public function isFormatError(): bool
    {
        return $this->getValidationReason() === 'invalid_format';
    }

    /**
     * Check if the error is due to invalid length
     */
    public function isLengthError(): bool
    {
        return $this->getValidationReason() === 'invalid_length';
    }

    /**
     * Check if the error is due to invalid characters
     */
    public function isCharacterError(): bool
    {
        return $this->getValidationReason() === 'invalid_characters';
    }

    /**
     * Check if the error is due to checksum failure
     */
    public function isChecksumError(): bool
    {
        return $this->getValidationReason() === 'checksum_failed';
    }

    /**
     * Check if the error is due to empty address
     */
    public function isEmptyError(): bool
    {
        return $this->getValidationReason() === 'empty_address';
    }

    /**
     * Render the exception as an HTTP response
     */
    public function render(Request $request)
    {
        $response = [
            'error' => 'Invalid Wallet Address',
            'message' => $this->getMessage(),
            'code' => $this->getCode(),
            'data' => [
                'wallet_address' => $this->walletAddress,
                'validation_errors' => $this->validationErrors,
                'reason' => $this->getValidationReason(),
            ],
        ];

        // Add specific context based on error type
        if ($this->isLengthError()) {
            $response['data']['actual_length'] = $this->context['actual_length'] ?? null;
            $response['data']['expected_length'] = $this->context['expected_length'] ?? 44;
        }

        if ($this->isCharacterError()) {
            $response['data']['invalid_characters'] = $this->context['invalid_characters'] ?? [];
        }

        // Add debug information in development
        if (config('app.debug')) {
            $response['debug'] = [
                'context' => $this->context,
                'file' => $this->getFile(),
                'line' => $this->getLine(),
            ];
        }

        return response()->json($response, $this->getCode());
    }
}