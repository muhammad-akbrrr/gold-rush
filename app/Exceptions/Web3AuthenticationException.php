<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class Web3AuthenticationException extends Exception
{
    protected $walletAddress;
    protected $authenticationStep;
    protected $context;

    public function __construct(
        string $message = 'Web3 authentication failed',
        ?string $walletAddress = null,
        ?string $authenticationStep = null,
        array $context = [],
        int $code = 0,
        ?Exception $previous = null
    ) {
        parent::__construct($message, $code, $previous);
        
        $this->walletAddress = $walletAddress;
        $this->authenticationStep = $authenticationStep;
        $this->context = $context;
    }

    /**
     * Create exception for signature verification failure
     */
    public static function signatureVerificationFailed(string $walletAddress, array $context = []): self
    {
        return new self(
            'Signature verification failed for wallet address',
            $walletAddress,
            'signature_verification',
            $context,
            Response::HTTP_UNAUTHORIZED
        );
    }

    /**
     * Create exception for invalid wallet address
     */
    public static function invalidWalletAddress(string $walletAddress, array $context = []): self
    {
        return new self(
            'Invalid wallet address format',
            $walletAddress,
            'wallet_validation',
            $context,
            Response::HTTP_BAD_REQUEST
        );
    }

    /**
     * Create exception for insufficient token balance
     */
    public static function insufficientBalance(string $walletAddress, int $currentBalance, int $requiredBalance): self
    {
        return new self(
            "Insufficient token balance for authentication. Required: {$requiredBalance}, Current: {$currentBalance}",
            $walletAddress,
            'balance_check',
            [
                'current_balance' => $currentBalance,
                'required_balance' => $requiredBalance,
            ],
            Response::HTTP_FORBIDDEN
        );
    }

    /**
     * Create exception for authentication session expired
     */
    public static function sessionExpired(string $walletAddress): self
    {
        return new self(
            'Web3 authentication session has expired',
            $walletAddress,
            'session_validation',
            [],
            Response::HTTP_UNAUTHORIZED
        );
    }

    /**
     * Create exception for rate limiting
     */
    public static function rateLimitExceeded(string $walletAddress, int $retryAfter): self
    {
        return new self(
            "Rate limit exceeded for wallet authentication. Try again in {$retryAfter} seconds",
            $walletAddress,
            'rate_limiting',
            ['retry_after' => $retryAfter],
            Response::HTTP_TOO_MANY_REQUESTS
        );
    }

    /**
     * Get the wallet address associated with this exception
     */
    public function getWalletAddress(): ?string
    {
        return $this->walletAddress;
    }

    /**
     * Get the authentication step where the error occurred
     */
    public function getAuthenticationStep(): ?string
    {
        return $this->authenticationStep;
    }

    /**
     * Get additional context about the error
     */
    public function getContext(): array
    {
        return $this->context;
    }

    /**
     * Get the suggested HTTP status code for this exception
     */
    public function getStatusCode(): int
    {
        return $this->code ?: Response::HTTP_UNAUTHORIZED;
    }

    /**
     * Render the exception as an HTTP response
     */
    public function render(Request $request)
    {
        $response = [
            'error' => 'Web3 Authentication Failed',
            'message' => $this->getMessage(),
            'code' => $this->getStatusCode(),
        ];

        // Add additional context for debugging in development
        if (config('app.debug')) {
            $response['debug'] = [
                'wallet_address' => $this->walletAddress,
                'authentication_step' => $this->authenticationStep,
                'context' => $this->context,
                'file' => $this->getFile(),
                'line' => $this->getLine(),
            ];
        }

        // Add retry-after header for rate limiting
        if ($this->authenticationStep === 'rate_limiting' && isset($this->context['retry_after'])) {
            return response()->json($response, $this->getStatusCode())
                ->header('Retry-After', $this->context['retry_after']);
        }

        return response()->json($response, $this->getStatusCode());
    }
}