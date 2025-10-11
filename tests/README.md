# Solana Test Helpers Documentation

This directory contains helper functions extracted from Solana tests to make testing more modular and reusable.


## How to Run Tests

### Quick Start Guide

For a quick setup, follow these steps:

```bash
# 1. Start local Solana validator
solana-test-validator --clone 2uPQGpm8X4ZkxMHxrAW1QuhXcse1AHEgPih6Xp9NuEWW --url https://api.mainnet-beta.solana.com --reset

# 2. In your Solana smart contract project directory
anchor deploy && anchor run deploy_testing

# 3. Copy the mint address from the output and update .env.testing
# 4. Run the test
php artisan test --filter=SingleRoundTest
```

### Prerequisites

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

# Keypair Paths (Default Solana CLI localnet keypairs)
# Update these paths according to your system's Solana CLI configuration
# These are the default paths when using solana-test-validator
ADMIN_KEYPAIR_PATH=/Users/hutomo/.config/solana/localnet/1.json
KEEPER_KEYPAIR_PATH=/Users/hutomo/.config/solana/localnet/2.json
TREASURY_KEYPAIR_PATH=/Users/hutomo/.config/solana/localnet/3.json
USER_KEYPAIR_PATH=/Users/hutomo/.config/solana/localnet/4.json

# Price Feed Configuration
# Gold price feed ID (32-byte hex string)
GOLD_PRICE_FEED_ID=0x765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2
# Push Oracle Program ID (cloned from mainnet)
DEFAULT_PUSH_ORACLE_PROGRAM_ID=2uPQGpm8X4ZkxMHxrAW1QuhXcse1AHEgPih6Xp9NuEWW

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

| Variable | Description | Example |
|----------|-------------|---------|
| `SOLANA_RPC_URL` | Solana RPC endpoint | `http://127.0.0.1:8899` |
| `PROGRAM_ID` | Your deployed program ID | `FM7SQyRJExhzjFYvZ6XZTLkSSjNcMdDkCq89PWF9FtMB` |
| `SYSTEM_PROGRAM_ID` | Solana System Program ID | `11111111111111111111111111111112` |
| `TOKEN_PROGRAM_ID` | SPL Token Program ID | `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` |
| `ASSOCIATED_TOKEN_PROGAM_ID` | Associated Token Program ID | `ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL` |
| `TOKEN_MINT` | Your token mint address | `3LpgtrCHmecZD76odqhUjkdZ1zbDMEPKJAyVgcRZUP2V` |
| `ADMIN_KEYPAIR_PATH` | Admin keypair file path | `/Users/hutomo/.config/solana/localnet/1.json` |
| `KEEPER_KEYPAIR_PATH` | Keeper keypair file path | `/Users/hutomo/.config/solana/localnet/2.json` |
| `TREASURY_KEYPAIR_PATH` | Treasury keypair file path | `/Users/hutomo/.config/solana/localnet/3.json` |
| `USER_KEYPAIR_PATH` | User keypair file path | `/Users/hutomo/.config/solana/localnet/4.json` |
| `GOLD_PRICE_FEED_ID` | Gold price feed ID (hex) | `0x765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2` |
| `DEFAULT_PUSH_ORACLE_PROGRAM_ID` | Push Oracle Program ID | `2uPQGpm8X4ZkxMHxrAW1QuhXcse1AHEgPih6Xp9NuEWW` |