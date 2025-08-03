<?php

namespace App\Providers;

use App\Contracts\SolanaServiceInterface;
use App\Contracts\Web3AuthServiceInterface;
use App\Contracts\TokenBalanceServiceInterface;
use App\Contracts\WalletValidationServiceInterface;
use App\Services\SolanaService;
use App\Services\Web3AuthService;
use App\Services\TokenBalanceService;
use App\Services\WalletValidationService;
use Illuminate\Support\ServiceProvider;

class Web3ServiceProvider extends ServiceProvider
{
  /**
   * Register services.
   */
  public function register(): void
  {
    // Bind interfaces to implementations
    $this->app->bind(SolanaServiceInterface::class, SolanaService::class);
    $this->app->bind(WalletValidationServiceInterface::class, WalletValidationService::class);
    $this->app->bind(TokenBalanceServiceInterface::class, TokenBalanceService::class);
    $this->app->bind(Web3AuthServiceInterface::class, Web3AuthService::class);

    // Register concrete implementations as singletons
    $this->app->singleton(SolanaService::class, function ($app) {
      return new SolanaService();
    });

    $this->app->singleton(WalletValidationService::class, function ($app) {
      return new WalletValidationService();
    });

    $this->app->singleton(TokenBalanceService::class, function ($app) {
      return new TokenBalanceService($app->make(SolanaServiceInterface::class));
    });

    $this->app->singleton(Web3AuthService::class, function ($app) {
      return new Web3AuthService($app->make(SolanaServiceInterface::class));
    });

    // Register interface aliases for easier access
    $this->app->alias(SolanaServiceInterface::class, 'solana');
    $this->app->alias(Web3AuthServiceInterface::class, 'web3.auth');
    $this->app->alias(TokenBalanceServiceInterface::class, 'web3.balance');
    $this->app->alias(WalletValidationServiceInterface::class, 'web3.validation');

    // Keep concrete class aliases for backward compatibility
    $this->app->alias(SolanaService::class, 'solana.concrete');
    $this->app->alias(Web3AuthService::class, 'web3.auth.concrete');
    $this->app->alias(TokenBalanceService::class, 'web3.balance.concrete');
    $this->app->alias(WalletValidationService::class, 'web3.validation.concrete');
  }

  /**
   * Bootstrap services.
   */
  public function boot(): void
  {
    // Publish configuration if needed
    if ($this->app->runningInConsole()) {
      $this->publishes([
        __DIR__ . '/../../config/web3.php' => config_path('web3.php'),
      ], 'web3-config');
    }
  }
}