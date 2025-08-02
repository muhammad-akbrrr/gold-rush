<?php

namespace Database\Seeders;

use App\Models\Web3User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Only create test data in local environment
        if (app()->environment('local')) {
            // Create test Web3 users with various balance scenarios
            Web3User::factory(5)->authenticated()->create();
            Web3User::factory(3)->insufficientBalance()->create();
            Web3User::factory(2)->create(); // Users with random balances
            
            $this->command->info('Created test Web3 users for local development');
        }
    }
}
