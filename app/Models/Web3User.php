<?php

namespace App\Models;

use App\Events\BalanceUpdated;
use App\Events\AuthenticationStatusChanged;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Web3User extends Authenticatable
{
  use HasFactory, Notifiable;

  /**
   * The table associated with the model.
   */
  protected $table = 'web3_users';

  /**
   * The attributes that are mass assignable.
   */
  protected $fillable = [
    'wallet_address',
    'display_name',
    'avatar_url',
    'token_balance',
    'last_balance_check',
    'is_authenticated',
    'authenticated_at',
  ];

  /**
   * The attributes that should be hidden for serialization.
   */
  protected $hidden = [
    'remember_token',
  ];

  /**
   * Get the attributes that should be cast.
   */
  protected function casts(): array
  {
    return [
      'token_balance' => 'integer',
      'last_balance_check' => 'datetime',
      'is_authenticated' => 'boolean',
      'authenticated_at' => 'datetime',
    ];
  }

  /**
   * Check if user has sufficient token balance for authentication
   */
  public function hasSufficientBalance(?int $minBalance = null): bool
  {
    $minBalance = $minBalance ?? config('web3.min_token_balance', 100000);
    return $this->token_balance >= $minBalance;
  }

  /**
   * Update token balance and authentication status
   */
  public function updateTokenBalance(int $balance): void
  {
    $previousBalance = $this->token_balance;
    $wasAuthenticated = $this->is_authenticated;
    
    $this->token_balance = $balance;
    $this->last_balance_check = now();

    $minBalance = config('web3.min_token_balance', 100000);
    $this->is_authenticated = $this->hasSufficientBalance($minBalance);

    if (!$wasAuthenticated && $this->is_authenticated) {
      $this->authenticated_at = now();
    }

    $this->save();

    // Dispatch balance updated event
    if ($previousBalance !== $balance) {
      event(new BalanceUpdated($this, $previousBalance, $balance, [
        'source' => 'updateTokenBalance',
        'min_balance_required' => $minBalance,
      ]));
    }

    // Dispatch authentication status change event if status changed
    if ($wasAuthenticated !== $this->is_authenticated) {
      if ($this->is_authenticated) {
        event(AuthenticationStatusChanged::login($this, [
          'triggered_by' => 'balance_update',
          'new_balance' => $balance,
          'previous_balance' => $previousBalance,
        ]));
      } else {
        event(AuthenticationStatusChanged::balanceLogout($this, $balance, $minBalance));
      }
    }
  }

  /**
   * Get the user's display name
   */
  public function getDisplayNameAttribute(): string
  {
    return $this->display_name ?? $this->getShortWalletAddressAttribute();
  }

  /**
   * Get short wallet address for display
   */
  public function getShortWalletAddressAttribute(): string
  {
    if (strlen($this->wallet_address) <= 12) {
      return $this->wallet_address;
    }

    return substr($this->wallet_address, 0, 6) . '...' . substr($this->wallet_address, -4);
  }

  /**
   * Get the name attribute for compatibility
   */
  public function getNameAttribute(): string
  {
    return $this->getDisplayNameAttribute();
  }

  /**
   * Get the email attribute for compatibility (returns wallet address)
   */
  public function getEmailAttribute(): string
  {
    return $this->wallet_address;
  }

  /**
   * Get the route key for the model (for route model binding)
   */
  public function getRouteKeyName(): string
  {
    return 'wallet_address';
  }

  /**
   * Scope to get authenticated users only
   */
  public function scopeAuthenticated($query)
  {
    return $query->where('is_authenticated', true);
  }

  /**
   * Scope to get users with sufficient balance
   */
  public function scopeWithSufficientBalance($query, ?int $minBalance = null)
  {
    $minBalance = $minBalance ?? config('web3.min_token_balance', 100000);
    return $query->where('token_balance', '>=', $minBalance);
  }
}