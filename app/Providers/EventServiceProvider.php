<?php

namespace App\Providers;

use App\Events\AuthenticationStatusChanged;
use App\Events\BalanceUpdated;
use App\Listeners\LogBalanceChange;
use App\Listeners\NotifyAuthStatusChange;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        // Web3 Balance Events
        BalanceUpdated::class => [
            LogBalanceChange::class,
        ],

        // Web3 Authentication Events
        AuthenticationStatusChanged::class => [
            NotifyAuthStatusChange::class,
        ],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        parent::boot();

        // Additional event configuration can go here
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}