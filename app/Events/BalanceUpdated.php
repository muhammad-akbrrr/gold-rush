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

class BalanceUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Web3User $user;
    public int $previousBalance;
    public int $newBalance;
    public string $changeType;
    public array $context;

    /**
     * Create a new event instance.
     */
    public function __construct(
        Web3User $user,
        int $previousBalance,
        int $newBalance,
        array $context = []
    ) {
        $this->user = $user;
        $this->previousBalance = $previousBalance;
        $this->newBalance = $newBalance;
        $this->context = $context;
        
        // Determine change type
        if ($newBalance > $previousBalance) {
            $this->changeType = 'increased';
        } elseif ($newBalance < $previousBalance) {
            $this->changeType = 'decreased';
        } else {
            $this->changeType = 'unchanged';
        }
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->user->id),
            new Channel('web3.balance.updates'),
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
            'previous_balance' => $this->previousBalance,
            'new_balance' => $this->newBalance,
            'change_amount' => $this->newBalance - $this->previousBalance,
            'change_type' => $this->changeType,
            'timestamp' => now()->toISOString(),
            'context' => $this->context,
        ];
    }

    /**
     * Get the event name for broadcasting.
     */
    public function broadcastAs(): string
    {
        return 'balance.updated';
    }

    /**
     * Determine if this event should broadcast.
     */
    public function broadcastWhen(): bool
    {
        return $this->changeType !== 'unchanged';
    }

    /**
     * Get the balance change amount.
     */
    public function getBalanceChange(): int
    {
        return $this->newBalance - $this->previousBalance;
    }

    /**
     * Check if balance increased.
     */
    public function isIncrease(): bool
    {
        return $this->changeType === 'increased';
    }

    /**
     * Check if balance decreased.
     */
    public function isDecrease(): bool
    {
        return $this->changeType === 'decreased';
    }

    /**
     * Check if balance dropped below authentication threshold.
     */
    public function isInsufficientForAuth(): bool
    {
        $minBalance = config('web3.min_token_balance', 100000);
        return $this->newBalance < $minBalance;
    }

    /**
     * Check if this was previously insufficient and now sufficient.
     */
    public function becameSufficient(): bool
    {
        $minBalance = config('web3.min_token_balance', 100000);
        return $this->previousBalance < $minBalance && $this->newBalance >= $minBalance;
    }

    /**
     * Get event context.
     */
    public function getContext(): array
    {
        return $this->context;
    }
}