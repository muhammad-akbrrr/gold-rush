<?php

namespace App\Listeners;

use App\Events\AuthenticationStatusChanged;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class NotifyAuthStatusChange implements ShouldQueue
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
    public function handle(AuthenticationStatusChanged $event): void
    {
        $logLevel = $this->determineLogLevel($event);
        $message = $this->formatLogMessage($event);
        $context = $this->buildLogContext($event);

        Log::log($logLevel, $message, $context);

        // Additional security logging for specific events
        if ($event->isLogin()) {
            Log::info('Web3 user successfully authenticated', [
                'user_id' => $event->user->id,
                'wallet_address' => $event->user->wallet_address,
                'login_method' => 'web3_signature',
                'context' => $event->getContext(),
            ]);
        }

        if ($event->isBalanceLogout()) {
            Log::warning('User automatically logged out due to insufficient balance', [
                'user_id' => $event->user->id,
                'wallet_address' => $event->user->wallet_address,
                'current_balance' => $event->getContext()['current_balance'] ?? null,
                'required_balance' => $event->getContext()['required_balance'] ?? null,
                'automatic_logout' => true,
            ]);
        }

        if ($event->isSessionExpired()) {
            Log::info('Web3 user session expired', [
                'user_id' => $event->user->id,
                'wallet_address' => $event->user->wallet_address,
                'automatic_logout' => true,
                'context' => $event->getContext(),
            ]);
        }

        if ($event->isAuthenticationFailure()) {
            Log::warning('Web3 authentication failed', [
                'user_id' => $event->user->id,
                'wallet_address' => $event->user->wallet_address,
                'failure_reason' => $event->reason,
                'context' => $event->getContext(),
            ]);
        }
    }

    /**
     * Determine the appropriate log level based on the authentication event.
     */
    private function determineLogLevel(AuthenticationStatusChanged $event): string
    {
        // Warning: Authentication failures, balance logouts
        if ($event->isAuthenticationFailure() || $event->isBalanceLogout()) {
            return 'warning';
        }

        // Info: Successful logins, normal logouts, session expirations
        if ($event->isLogin() || ($event->isLogout() && !$event->isAutomaticLogout())) {
            return 'info';
        }

        // Info: Automatic logouts (session expired, etc.)
        if ($event->isAutomaticLogout()) {
            return 'info';
        }

        // Debug: Other status changes
        return 'debug';
    }

    /**
     * Format the log message.
     */
    private function formatLogMessage(AuthenticationStatusChanged $event): string
    {
        if ($event->isLogin()) {
            return 'Web3 user logged in successfully';
        }

        if ($event->isLogout()) {
            $reason = $event->getLogoutReason();
            return "Web3 user logged out: {$reason}";
        }

        if ($event->isAuthenticationFailure()) {
            return "Web3 authentication failed: {$event->reason}";
        }

        return "Web3 authentication status changed: {$event->previousStatus} → {$event->newStatus}";
    }

    /**
     * Build the log context.
     */
    private function buildLogContext(AuthenticationStatusChanged $event): array
    {
        return [
            'event' => 'auth_status_changed',
            'user_id' => $event->user->id,
            'wallet_address' => $event->user->wallet_address,
            'previous_status' => $event->previousStatus,
            'new_status' => $event->newStatus,
            'reason' => $event->reason,
            'is_login' => $event->isLogin(),
            'is_logout' => $event->isLogout(),
            'is_automatic_logout' => $event->isAutomaticLogout(),
            'is_balance_logout' => $event->isBalanceLogout(),
            'is_session_expired' => $event->isSessionExpired(),
            'is_authentication_failure' => $event->isAuthenticationFailure(),
            'context' => $event->getContext(),
            'timestamp' => now()->toISOString(),
        ];
    }

    /**
     * Handle a job failure.
     */
    public function failed(AuthenticationStatusChanged $event, \Throwable $exception): void
    {
        Log::error('Failed to log authentication status change event', [
            'user_id' => $event->user->id,
            'wallet_address' => $event->user->wallet_address,
            'event_reason' => $event->reason,
            'error' => $exception->getMessage(),
            'exception_class' => get_class($exception),
        ]);
    }
}