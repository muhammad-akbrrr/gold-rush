<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class InsufficientTokenBalanceException extends Exception
{
    protected $walletAddress;
    protected $currentBalance;
    protected $requiredBalance;
    protected $tokenMintAddress;
    protected $context;

    public function __construct(
        string $walletAddress,
        int $currentBalance,
        int $requiredBalance,
        ?string $tokenMintAddress = null,
        array $context = [],
        ?Exception $previous = null
    ) {
        $message = "Insufficient token balance. Required: {$requiredBalance}, Current: {$currentBalance}";
        
        parent::__construct($message, Response::HTTP_FORBIDDEN, $previous);
        
        $this->walletAddress = $walletAddress;
        $this->currentBalance = $currentBalance;
        $this->requiredBalance = $requiredBalance;
        $this->tokenMintAddress = $tokenMintAddress ?? config('web3.token_mint_address');
        $this->context = $context;
    }

    /**
     * Create exception for authentication balance check
     */
    public static function forAuthentication(string $walletAddress, int $currentBalance, int $requiredBalance): self
    {
        return new self(
            $walletAddress,
            $currentBalance,
            $requiredBalance,
            null,
            ['operation' => 'authentication']
        );
    }

    /**
     * Create exception for operation requiring minimum balance
     */
    public static function forOperation(string $walletAddress, int $currentBalance, int $requiredBalance, string $operation): self
    {
        return new self(
            $walletAddress,
            $currentBalance,
            $requiredBalance,
            null,
            ['operation' => $operation]
        );
    }

    /**
     * Create exception when balance falls below threshold during session
     */
    public static function balanceDropped(string $walletAddress, int $previousBalance, int $currentBalance, int $requiredBalance): self
    {
        return new self(
            $walletAddress,
            $currentBalance,
            $requiredBalance,
            null,
            [
                'operation' => 'session_validation',
                'previous_balance' => $previousBalance,
                'balance_dropped' => true,
            ]
        );
    }

    /**
     * Get the wallet address
     */
    public function getWalletAddress(): string
    {
        return $this->walletAddress;
    }

    /**
     * Get the current token balance
     */
    public function getCurrentBalance(): int
    {
        return $this->currentBalance;
    }

    /**
     * Get the required token balance
     */
    public function getRequiredBalance(): int
    {
        return $this->requiredBalance;
    }

    /**
     * Get the token mint address
     */
    public function getTokenMintAddress(): ?string
    {
        return $this->tokenMintAddress;
    }

    /**
     * Get the balance deficit
     */
    public function getDeficit(): int
    {
        return max(0, $this->requiredBalance - $this->currentBalance);
    }

    /**
     * Get additional context
     */
    public function getContext(): array
    {
        return $this->context;
    }

    /**
     * Check if this was triggered by a balance drop during session
     */
    public function isBalanceDropped(): bool
    {
        return $this->context['balance_dropped'] ?? false;
    }

    /**
     * Get the operation that triggered this exception
     */
    public function getOperation(): string
    {
        return $this->context['operation'] ?? 'unknown';
    }

    /**
     * Render the exception as an HTTP response
     */
    public function render(Request $request)
    {
        $response = [
            'error' => 'Insufficient Token Balance',
            'message' => $this->getMessage(),
            'code' => $this->getCode(),
            'data' => [
                'wallet_address' => $this->walletAddress,
                'current_balance' => $this->currentBalance,
                'required_balance' => $this->requiredBalance,
                'deficit' => $this->getDeficit(),
                'token_mint_address' => $this->tokenMintAddress,
                'operation' => $this->getOperation(),
            ],
        ];

        // Add balance drop context if applicable
        if ($this->isBalanceDropped()) {
            $response['data']['previous_balance'] = $this->context['previous_balance'];
            $response['data']['balance_dropped'] = true;
            $response['message'] = 'Token balance dropped below required threshold. Please top up your wallet.';
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