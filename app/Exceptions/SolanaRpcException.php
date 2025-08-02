<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SolanaRpcException extends Exception
{
    protected $rpcMethod;
    protected $rpcUrl;
    protected $rpcError;
    protected $responseCode;
    protected $context;

    public function __construct(
        string $message,
        ?string $rpcMethod = null,
        ?string $rpcUrl = null,
        ?array $rpcError = null,
        ?int $responseCode = null,
        array $context = [],
        ?Exception $previous = null
    ) {
        parent::__construct($message, $responseCode ?? Response::HTTP_SERVICE_UNAVAILABLE, $previous);
        
        $this->rpcMethod = $rpcMethod;
        $this->rpcUrl = $rpcUrl;
        $this->rpcError = $rpcError;
        $this->responseCode = $responseCode;
        $this->context = $context;
    }

    /**
     * Create exception for connection timeout
     */
    public static function connectionTimeout(string $rpcUrl, int $timeout, array $context = []): self
    {
        return new self(
            "Solana RPC connection timeout after {$timeout} seconds",
            null,
            $rpcUrl,
            null,
            Response::HTTP_REQUEST_TIMEOUT,
            array_merge($context, [
                'reason' => 'connection_timeout',
                'timeout' => $timeout,
            ])
        );
    }

    /**
     * Create exception for RPC method error
     */
    public static function methodError(string $method, array $rpcError, string $rpcUrl, array $context = []): self
    {
        $message = "Solana RPC method '{$method}' failed";
        
        if (isset($rpcError['message'])) {
            $message .= ": {$rpcError['message']}";
        }
        
        return new self(
            $message,
            $method,
            $rpcUrl,
            $rpcError,
            Response::HTTP_BAD_GATEWAY,
            array_merge($context, ['reason' => 'method_error'])
        );
    }

    /**
     * Create exception for invalid response format
     */
    public static function invalidResponse(string $method, string $rpcUrl, array $context = []): self
    {
        return new self(
            "Invalid response format from Solana RPC for method '{$method}'",
            $method,
            $rpcUrl,
            null,
            Response::HTTP_BAD_GATEWAY,
            array_merge($context, ['reason' => 'invalid_response'])
        );
    }

    /**
     * Create exception for network unavailable
     */
    public static function networkUnavailable(string $rpcUrl, ?int $httpCode = null, array $context = []): self
    {
        return new self(
            "Solana network unavailable at {$rpcUrl}",
            null,
            $rpcUrl,
            null,
            $httpCode ?? Response::HTTP_SERVICE_UNAVAILABLE,
            array_merge($context, ['reason' => 'network_unavailable'])
        );
    }

    /**
     * Create exception for rate limiting by RPC provider
     */
    public static function rateLimited(string $rpcUrl, ?int $retryAfter = null, array $context = []): self
    {
        $message = "Rate limited by Solana RPC provider";
        
        if ($retryAfter) {
            $message .= ". Retry after {$retryAfter} seconds";
        }
        
        return new self(
            $message,
            null,
            $rpcUrl,
            null,
            Response::HTTP_TOO_MANY_REQUESTS,
            array_merge($context, [
                'reason' => 'rate_limited',
                'retry_after' => $retryAfter,
            ])
        );
    }

    /**
     * Create exception for authentication failure with RPC provider
     */
    public static function authenticationFailed(string $rpcUrl, array $context = []): self
    {
        return new self(
            "Authentication failed with Solana RPC provider",
            null,
            $rpcUrl,
            null,
            Response::HTTP_UNAUTHORIZED,
            array_merge($context, ['reason' => 'authentication_failed'])
        );
    }

    /**
     * Get the RPC method that failed
     */
    public function getRpcMethod(): ?string
    {
        return $this->rpcMethod;
    }

    /**
     * Get the RPC URL
     */
    public function getRpcUrl(): ?string
    {
        return $this->rpcUrl;
    }

    /**
     * Get the RPC error details
     */
    public function getRpcError(): ?array
    {
        return $this->rpcError;
    }

    /**
     * Get the HTTP response code
     */
    public function getResponseCode(): ?int
    {
        return $this->responseCode;
    }

    /**
     * Get additional context
     */
    public function getContext(): array
    {
        return $this->context;
    }

    /**
     * Get the failure reason
     */
    public function getFailureReason(): string
    {
        return $this->context['reason'] ?? 'unknown';
    }

    /**
     * Check if this is a temporary error that might succeed on retry
     */
    public function isRetryable(): bool
    {
        $retryableReasons = [
            'connection_timeout',
            'network_unavailable',
            'rate_limited',
        ];
        
        return in_array($this->getFailureReason(), $retryableReasons);
    }

    /**
     * Check if this is a rate limiting error
     */
    public function isRateLimited(): bool
    {
        return $this->getFailureReason() === 'rate_limited';
    }

    /**
     * Get retry after seconds for rate limiting
     */
    public function getRetryAfter(): ?int
    {
        return $this->context['retry_after'] ?? null;
    }

    /**
     * Render the exception as an HTTP response
     */
    public function render(Request $request)
    {
        $response = [
            'error' => 'Solana RPC Error',
            'message' => $this->getMessage(),
            'code' => $this->getCode(),
            'data' => [
                'reason' => $this->getFailureReason(),
                'rpc_method' => $this->rpcMethod,
                'retryable' => $this->isRetryable(),
            ],
        ];

        // Add RPC error details if available
        if ($this->rpcError) {
            $response['data']['rpc_error'] = $this->rpcError;
        }

        // Add retry after for rate limiting
        if ($this->isRateLimited() && $this->getRetryAfter()) {
            $response['data']['retry_after'] = $this->getRetryAfter();
        }

        // Add debug information in development
        if (config('app.debug')) {
            $response['debug'] = [
                'rpc_url' => $this->rpcUrl,
                'response_code' => $this->responseCode,
                'context' => $this->context,
                'file' => $this->getFile(),
                'line' => $this->getLine(),
            ];
        }

        $headers = [];
        
        // Add retry-after header for rate limiting
        if ($this->isRateLimited() && $this->getRetryAfter()) {
            $headers['Retry-After'] = $this->getRetryAfter();
        }

        return response()->json($response, $this->getCode(), $headers);
    }
}