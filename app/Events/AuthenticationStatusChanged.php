<?php

namespace App\Events;

use App\Models\Web3User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AuthenticationStatusChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Web3User $user;
    public string $previousStatus;
    public string $newStatus;
    public string $reason;
    public array $context;

    /**
     * Create a new event instance.
     */
    public function __construct(
        Web3User $user,
        string $previousStatus,
        string $newStatus,
        string $reason = '',
        array $context = []
    ) {
        $this->user = $user;
        $this->previousStatus = $previousStatus;
        $this->newStatus = $newStatus;
        $this->reason = $reason;
        $this->context = $context;
    }

    /**
     * Create event for successful login.
     */
    public static function login(Web3User $user, array $context = []): self
    {
        return new self(
            $user,
            'unauthenticated',
            'authenticated',
            'successful_login',
            $context
        );
    }

    /**
     * Create event for logout.
     */
    public static function logout(Web3User $user, string $reason = 'user_initiated', array $context = []): self
    {
        return new self(
            $user,
            'authenticated',
            'unauthenticated',
            $reason,
            $context
        );
    }

    /**
     * Create event for automatic logout due to insufficient balance.
     */
    public static function balanceLogout(Web3User $user, int $currentBalance, int $requiredBalance): self
    {
        return new self(
            $user,
            'authenticated',
            'unauthenticated',
            'insufficient_balance',
            [
                'current_balance' => $currentBalance,
                'required_balance' => $requiredBalance,
                'automatic_logout' => true,
            ]
        );
    }

    /**
     * Create event for session expiration.
     */
    public static function sessionExpired(Web3User $user, array $context = []): self
    {
        return new self(
            $user,
            'authenticated',
            'unauthenticated',
            'session_expired',
            array_merge($context, ['automatic_logout' => true])
        );
    }

    /**
     * Create event for authentication failure.
     */
    public static function authenticationFailed(Web3User $user, string $reason, array $context = []): self
    {
        return new self(
            $user,
            'unauthenticated',
            'failed',
            $reason,
            $context
        );
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->user->id),
            new Channel('web3.auth.status'),
        ];
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'user_id' => $this->user->id,
            'wallet_address' => $this->user->wallet_address,
            'previous_status' => $this->previousStatus,
            'new_status' => $this->newStatus,
            'reason' => $this->reason,
            'timestamp' => now()->toISOString(),
            'context' => $this->context,
        ];
    }

    /**
     * Get the event name for broadcasting.
     */
    public function broadcastAs(): string
    {
        return 'auth.status.changed';
    }

    /**
     * Check if this is a login event.
     */
    public function isLogin(): bool
    {
        return $this->newStatus === 'authenticated' && $this->previousStatus !== 'authenticated';
    }

    /**
     * Check if this is a logout event.
     */
    public function isLogout(): bool
    {
        return $this->previousStatus === 'authenticated' && $this->newStatus !== 'authenticated';
    }

    /**
     * Check if this is an automatic logout.
     */
    public function isAutomaticLogout(): bool
    {
        return $this->isLogout() && ($this->context['automatic_logout'] ?? false);
    }

    /**
     * Check if logout was due to insufficient balance.
     */
    public function isBalanceLogout(): bool
    {
        return $this->reason === 'insufficient_balance';
    }

    /**
     * Check if this is a session expiration.
     */
    public function isSessionExpired(): bool
    {
        return $this->reason === 'session_expired';
    }

    /**
     * Check if this is an authentication failure.
     */
    public function isAuthenticationFailure(): bool
    {
        return $this->newStatus === 'failed';
    }

    /**
     * Get the logout reason if this is a logout event.
     */
    public function getLogoutReason(): ?string
    {
        return $this->isLogout() ? $this->reason : null;
    }

    /**
     * Get event context.
     */
    public function getContext(): array
    {
        return $this->context;
    }
}