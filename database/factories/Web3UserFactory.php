<?php

namespace Database\Factories;

use App\Models\Web3User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Web3User>
 */
class Web3UserFactory extends Factory
{
  /**
   * The name of the factory's corresponding model.
   *
   * @var string
   */
  protected $model = Web3User::class;

  /**
   * Define the model's default state.
   *
   * @return array<string, mixed>
   */
  public function definition(): array
  {
    return [
      'wallet_address' => $this->generateSolanaAddress(),
      'display_name' => fake()->optional()->name(),
      'avatar_url' => fake()->optional()->imageUrl(),
      'token_balance' => fake()->numberBetween(0, 1000000),
      'last_balance_check' => fake()->optional()->dateTimeThisMonth(),
      'is_authenticated' => false,
      'authenticated_at' => null,
    ];
  }

  /**
   * Indicate that the user has sufficient balance for authentication.
   */
  public function authenticated(): static
  {
    return $this->state(fn(array $attributes) => [
      'token_balance' => fake()->numberBetween(100000, 1000000),
      'is_authenticated' => true,
      'authenticated_at' => fake()->dateTimeThisMonth(),
    ]);
  }

  /**
   * Indicate that the user has insufficient balance.
   */
  public function insufficientBalance(): static
  {
    return $this->state(fn(array $attributes) => [
      'token_balance' => fake()->numberBetween(0, 99999),
      'is_authenticated' => false,
      'authenticated_at' => null,
    ]);
  }

  /**
   * Generate a fake Solana address.
   */
  private function generateSolanaAddress(): string
  {
    $chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    $address = '';

    for ($i = 0; $i < 44; $i++) {
      $address .= $chars[rand(0, strlen($chars) - 1)];
    }

    return $address;
  }
}