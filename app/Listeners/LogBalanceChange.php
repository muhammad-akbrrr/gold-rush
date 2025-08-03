<?php

namespace App\Listeners;

use App\Events\BalanceUpdated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class LogBalanceChange implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(BalanceUpdated $event): void
    {
        $logLevel = $this->determineLogLevel($event);
        $message = $this->formatLogMessage($event);
        $context = $this->buildLogContext($event);

        Log::log($logLevel, $message, $context);

        // Additional logging for critical balance changes
        if ($event->isInsufficientForAuth()) {
            Log::warning('User balance dropped below authentication threshold', [
                'user_id' => $event->user->id,
                'wallet_address' => $event->user->wallet_address,
                'current_balance' => $event->newBalance,
                'required_balance' => config('web3.min_token_balance'),
                'previous_balance' => $event->previousBalance,
                'context' => $event->getContext(),
            ]);
        }

        if ($event->becameSufficient()) {
            Log::info('User balance became sufficient for authentication', [
                'user_id' => $event->user->id,
                'wallet_address' => $event->user->wallet_address,
                'current_balance' => $event->newBalance,
                'required_balance' => config('web3.min_token_balance'),
                'previous_balance' => $event->previousBalance,
                'context' => $event->getContext(),
            ]);
        }
    }

    /**
     * Determine the appropriate log level based on the balance change.
     */
    private function determineLogLevel(BalanceUpdated $event): string
    {
        // Critical: Balance dropped below authentication threshold
        if ($event->isInsufficientForAuth() && $event->isDecrease()) {
            return 'warning';
        }

        // Info: Balance became sufficient
        if ($event->becameSufficient()) {
            return 'info';
        }

        // Info: Normal balance changes
        if ($event->isIncrease() || $event->isDecrease()) {
            return 'info';
        }

        // Debug: No change
        return 'debug';
    }

    /**
     * Format the log message.
     */
    private function formatLogMessage(BalanceUpdated $event): string
    {
        $change = $event->getBalanceChange();
        $changeFormatted = $change > 0 ? "+{$change}" : (string) $change;

        return "Web3 user balance {$event->changeType}: {$changeFormatted} tokens";
    }

    /**
     * Build the log context.
     */
    private function buildLogContext(BalanceUpdated $event): array
    {
        return [
            'event' => 'balance_updated',
            'user_id' => $event->user->id,
            'wallet_address' => $event->user->wallet_address,
            'previous_balance' => $event->previousBalance,
            'new_balance' => $event->newBalance,
            'change_amount' => $event->getBalanceChange(),
            'change_type' => $event->changeType,
            'is_sufficient_for_auth' => !$event->isInsufficientForAuth(),
            'min_required_balance' => config('web3.min_token_balance'),
            'context' => $event->getContext(),
            'timestamp' => now()->toISOString(),
        ];
    }

    /**
     * Handle a job failure.
     */
    public function failed(BalanceUpdated $event, \Throwable $exception): void
    {
        Log::error('Failed to log balance change event', [
            'user_id' => $event->user->id,
            'wallet_address' => $event->user->wallet_address,
            'error' => $exception->getMessage(),
            'exception_class' => get_class($exception),
        ]);
    }
}