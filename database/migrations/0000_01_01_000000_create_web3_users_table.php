<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('web3_users', function (Blueprint $table) {
            $table->id();
            $table->string('wallet_address', 44)->unique(); // Solana addresses are 32-44 characters
            $table->string('display_name')->nullable();
            $table->string('avatar_url')->nullable();
            $table->bigInteger('token_balance')->default(0);
            $table->timestamp('last_balance_check')->nullable();
            $table->boolean('is_authenticated')->default(false);
            $table->timestamp('authenticated_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['wallet_address']);
            $table->index(['is_authenticated']);
            $table->index(['last_balance_check']);
            $table->index(['token_balance']);
        });

        // Create sessions table for Web3 users
        Schema::create('web3_sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
            
            // Foreign key constraint with cascade delete
            $table->foreign('user_id')->references('id')->on('web3_users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('web3_sessions');
        Schema::dropIfExists('web3_users');
    }
}; 