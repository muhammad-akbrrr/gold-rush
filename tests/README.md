# Solana Test Helpers Documentation

This directory contains helper functions extracted from Solana tests to make testing more modular and reusable.

## Quick Start - Recommended Workflow

**IMPORTANT:** The Laravel integration tests create rounds and place bets, but settlement is handled by separate Rust keeper bots. This mimics the production architecture where keepers run as automated services.

### Step 1: Setup Environment

```bash
# 1. Copy the example environment file
cp .env.testing.example .env.testing

# 2. Ensure wallet files are in tests/Wallets/
# - 1.json (admin/keeper/treasury wallet)
# - 2.json (user wallet)
```

### Step 2: Run Laravel Integration Tests (Create Rounds & Place Bets)

**Single Asset Betting:**
```bash
php artisan test --filter=SingleRoundTest
```
This will:
- Create a new betting round
- Start the round at the scheduled time
- Place a bet from the user

**Group Battle Betting:**
```bash
php artisan test --filter=GroupRoundTest
```
This will:
- Create a group battle round
- Insert groups and assets
- Capture starting prices
- Start the round
- Place a bet

### Step 3: Run Rust Keeper Bots (Settle Rounds)

After creating rounds with the Laravel tests, the keeper bots handle settlement:

**Start a keeper bot for settling rounds:**
```bash
# In your Rust keeper project directory
cargo run -p keepers --bin settle_round
```

This keeper bot will:
- Monitor for rounds that have ended
- Capture final prices from Pyth oracles
- Settle all bets (determine winners/losers)
- Distribute treasury fees
- Run every 3 minutes by default (configurable via `SETTLE_ROUND_PERIOD_IN_SECS` in `.env`)

### Step 4: Claim Rewards (Optional)

Winners can claim their rewards through the web UI or by running a claim transaction manually.

---

## Alternative: Full End-to-End Testing in Laravel

If you want to test the complete lifecycle (including settlement) within Laravel tests, you can uncomment steps 4-5 in `SingleRoundTest.php` and steps 9-13 in `GroupRoundTest.php`. However, note that you'll need to adjust timing to ensure rounds have fully ended before settlement.

---

## How to Run Tests

### Quick Start Guide (Legacy - Full E2E in Laravel)

Choose one of the following options based on your preference:

#### Option 1: Running on Devnet (Recommended for Quick Testing)

```bash
# 1. Copy the example environment file
cp .env.testing.example .env.testing

# 2. Run the test (creates round, starts, bets - settlement via keeper bot)
php artisan test --filter=SingleRoundTest
```

#### Option 2: Running on Local Network

```bash
# 1. Start local Solana validator
solana-test-validator --clone 2uPQGpm8X4ZkxMHxrAW1QuhXcse1AHEgPih6Xp9NuEWW --url https://api.mainnet-beta.solana.com --reset

# 2. In your Solana smart contract project directory
anchor deploy && anchor run deploy_testing

# 3. Copy the mint address from the output and update .env.testing
# 4. Run the test
php artisan test --filter=SingleRoundTest
```

## Setup Instructions

### Option 1: Devnet Setup (Recommended)

Running tests on Solana devnet is the easiest way to get started as it uses pre-deployed programs and doesn't require local validator setup.

#### Prerequisites for Devnet
- Program already deployed on devnet
- Token mint already created on devnet

#### Steps for Devnet Setup

1. **Copy the example environment file**
```bash
cp .env.testing.example .env.testing
```

2. **Configure environment variables for devnet**
Update the following values in `.env.testing`:
```env
# Devnet Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
PROGRAM_ID=YOUR_DEPLOYED_PROGRAM_ID_ON_DEVNET
TOKEN_MINT=YOUR_TOKEN_MINT_ON_DEVNET

# Wallet paths (already configured for project wallets)
ADMIN_KEYPAIR_PATH=tests/Wallets/1.json
KEEPER_KEYPAIR_PATH=tests/Wallets/1.json
TREASURY_KEYPAIR_PATH=tests/Wallets/1.json
USER_KEYPAIR_PATH=tests/Wallets/2.json

# Other required configurations
SYSTEM_PROGRAM_ID=11111111111111111111111111111112
TOKEN_PROGRAM_ID=TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
ASSOCIATED_TOKEN_PROGAM_ID=ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL
GOLD_PRICE_FEED_ID=0x765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2
PUSH_ORACLE_PROGRAM_ID=2uPQGpm8X4ZkxMHxrAW1QuhXcse1AHEgPih6Xp9NuEWW
```

3. **Run the tests**
```bash
php artisan test --filter=SingleRoundTest
```

**Note**: The `.env.testing.example` file is already configured with devnet settings. You only need to update the `PROGRAM_ID` and `TOKEN_MINT` values with your deployed program details.

### Option 2: Local Network Setup

Before running the SingleRoundTest on local network, you need to prepare the following:

#### 1. Install Solana CLI
```bash
# Install Solana CLI (if not already installed)
sh -c "$(curl -sSfL https://release.solana.com/v1.18.4/install)"
```

#### 2. Start Local Solana Test Validator
```bash
# Start local validator with mainnet clone for price feeds
solana-test-validator --clone 2uPQGpm8X4ZkxMHxrAW1QuhXcse1AHEgPih6Xp9NuEWW --url https://api.mainnet-beta.solana.com --reset
```

#### 3. Deploy Smart Contract
Navigate to your Solana smart contract project and run:
```bash
# Deploy the program and initialize testing environment
anchor deploy && anchor run deploy_testing
```

After deployment, you'll see output similar to:
```
Deploying cluster: http://0.0.0.0:8899
Upgrade authority: /Users/hutomo/.config/solana/localnet/1.json
Deploying program "gold_rush"...
Program path: /Users/hutomo/Desktop/Koding/Solana/Projects/gold-rush/target/deploy/gold_rush.so...
Program Id: FM7SQyRJExhzjFYvZ6XZTLkSSjNcMdDkCq89PWF9FtMB

Signature: 4qxXxFo1ABMuvHcfFNMkX7NJHdVG5eLFNgLGvU5FfB4KVKs5fNGnbgegXiDNMDgMjNBytCxTMqYVWo1bh9YYBGh4

Deploy success
bigint: Failed to load bindings, pure JS will be used (try npm run rebuild?)
Starting deployment...
Created mint: 3LpgtrCHmecZD76odqhUjkdZ1zbDMEPKJAyVgcRZUP2V
Initialize successful: 5EtGi1kEzPyykpSf2QLh9KkUepyt4PpWUUy8gf9JMuPkvS5qgMECxyHmex8pJDwDr8yx78aYkaAifNec5p4hargA
Config PDA: BfUw1W5aC38PRK7j84yYhBrCjYYvtVjbJhS5uHQMPbwR
```

**Important**: Copy the mint address from the output (e.g., `3LpgtrCHmecZD76odqhUjkdZ1zbDMEPKJAyVgcRZUP2V`).

#### 4. Configure Environment Variables
Create or update your `.env.testing` file with the following configuration:

```env
# Solana Test Environment Configuration
# Copy and update the values according to your setup

# Solana Network Configuration
SOLANA_RPC_URL=http://127.0.0.1:8899

# Program IDs
# Update PROGRAM_ID with your deployed program ID from anchor deploy output
PROGRAM_ID=FM7SQyRJExhzjFYvZ6XZTLkSSjNcMdDkCq89PWF9FtMB
SYSTEM_PROGRAM_ID=11111111111111111111111111111112
TOKEN_PROGRAM_ID=TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
ASSOCIATED_TOKEN_PROGAM_ID=ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL

# Token Configuration
# Update TOKEN_MINT with the mint address from your anchor run deploy_testing output
TOKEN_MINT=3LpgtrCHmecZD76odqhUjkdZ1zbDMEPKJAyVgcRZUP2V

# Keypair Paths (Project test wallets)
# Using wallet files from the project's tests/Wallets directory
# These are test keypairs included in the project for testing purposes
ADMIN_KEYPAIR_PATH=tests/Wallets/1.json
KEEPER_KEYPAIR_PATH=tests/Wallets/2.json
TREASURY_KEYPAIR_PATH=tests/Wallets/3.json
USER_KEYPAIR_PATH=tests/Wallets/4.json

# Price Feed Configuration
# Gold price feed ID (32-byte hex string)
GOLD_PRICE_FEED_ID=0x765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2
# Push Oracle Program ID (cloned from mainnet)
PUSH_ORACLE_PROGRAM_ID=2uPQGpm8X4ZkxMHxrAW1QuhXcse1AHEgPih6Xp9NuEWW

# Laravel Test Configuration
APP_ENV=testing
APP_DEBUG=true
APP_KEY=base64:your-app-key-here

# Database Configuration (if needed for tests)
DB_CONNECTION=sqlite
DB_DATABASE=:memory:

# Cache Configuration
CACHE_DRIVER=array
SESSION_DRIVER=array
QUEUE_CONNECTION=sync
```

**Note**: 
- Update `TOKEN_MINT` with the mint address from your deployment output
- Update `PROGRAM_ID` with your deployed program ID
- Adjust keypair paths according to your system's Solana CLI configuration

#### 5. Run the Tests
```bash
# Run the SingleRoundTest specifically
php artisan test --filter=SingleRoundTest
```

## Environment Variables Reference

The following environment variables must be set in your `.env.testing` file:

### For Devnet Configuration

| Variable | Description | Devnet Example |
|----------|-------------|----------------|
| `SOLANA_RPC_URL` | Solana RPC endpoint | `https://api.devnet.solana.com` |
| `PROGRAM_ID` | Your deployed program ID on devnet | `3Ut8a8pvtNBEXY3ukuQzXgHpADByembaMqeCrBiyiKXv` |
| `TOKEN_MINT` | Your token mint address on devnet | `88gWmAHfsk7ibtkYdAofoF41JaKetQufM9L34c87h9WG` |

### For Local Network Configuration

| Variable | Description | Local Example |
|----------|-------------|---------------|
| `SOLANA_RPC_URL` | Solana RPC endpoint | `http://127.0.0.1:8899` |
| `PROGRAM_ID` | Your deployed program ID | `3Ut8a8pvtNBEXY3ukuQzXgHpADByembaMqeCrBiyiKXv` |
| `TOKEN_MINT` | Your token mint address | `YOUR_TOKEN_MINT_ON_LOCALNET` |

### Common Configuration (Same for Both Networks)

| Variable | Description | Example |
|----------|-------------|---------|
| `SYSTEM_PROGRAM_ID` | Solana System Program ID | `11111111111111111111111111111112` |
| `TOKEN_PROGRAM_ID` | SPL Token Program ID | `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` |
| `ASSOCIATED_TOKEN_PROGAM_ID` | Associated Token Program ID | `ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL` |
| `ADMIN_KEYPAIR_PATH` | Admin keypair file path | `tests/Wallets/1.json` |
| `KEEPER_KEYPAIR_PATH` | Keeper keypair file path | `tests/Wallets/1.json` |
| `TREASURY_KEYPAIR_PATH` | Treasury keypair file path | `tests/Wallets/1.json` |
| `USER_KEYPAIR_PATH` | User keypair file path | `tests/Wallets/2.json` |
| `GOLD_PRICE_FEED_ID` | Gold price feed ID (hex) | `0x765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2` |
| `PUSH_ORACLE_PROGRAM_ID` | Push Oracle Program ID | `2uPQGpm8X4ZkxMHxrAW1QuhXcse1AHEgPih6Xp9NuEWW` |