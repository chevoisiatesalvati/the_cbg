# the_cbg - Smart Contracts

This directory contains the smart contracts for the_cbg, built with Hardhat and optimized for the Celo blockchain.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Compile contracts
pnpm compile

# Run tests
pnpm test

# Deploy to Alfajores testnet
pnpm deploy:alfajores

# Deploy to Sepolia testnet
pnpm deploy:sepolia

# Deploy to Celo mainnet
pnpm deploy:celo
```

## 📜 Available Scripts

- `pnpm compile` - Compile smart contracts
- `pnpm test` - Run contract tests
- `pnpm deploy` - Deploy to local network
- `pnpm deploy:alfajores` - Deploy to Celo Alfajores testnet
- `pnpm deploy:sepolia` - Deploy to Celo Sepolia testnet
- `pnpm deploy:celo` - Deploy to Celo mainnet
- `pnpm verify` - Verify contracts on Celoscan
- `pnpm clean` - Clean artifacts and cache

## 🌐 Networks

### Celo Mainnet
- **Chain ID**: 42220
- **RPC URL**: https://forno.celo.org
- **Explorer**: https://celoscan.io

### Alfajores Testnet
- **Chain ID**: 44787
- **RPC URL**: https://alfajores-forno.celo-testnet.org
- **Explorer**: https://alfajores.celoscan.io
- **Faucet**: https://faucet.celo.org

### Sepolia Testnet
- **Chain ID**: 11142220
- **RPC URL**: https://forno.celo-sepolia.celo-testnet.org
- **Explorer**: https://celo-sepolia.blockscout.com
- **Faucet**: https://faucet.celo.org/celo-sepolia

## 🔧 Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Fill in your private key and API keys:
   ```env
   PRIVATE_KEY=your_private_key_without_0x_prefix
   CELOSCAN_API_KEY=your_celoscan_api_key
   ```

## 📁 Project Structure

```
contracts/          # Smart contract source files
├── ButtonGame.sol  # Main game contract
├── CBGToken.sol    # ERC-20 token contract

test/              # Contract tests
├── Lock.ts        # Tests for Lock contract

ignition/          # Deployment scripts
└── modules/
    └── ButtonGame.ts    # ButtonGame contract deployment

hardhat.config.ts  # Hardhat configuration
tsconfig.json      # TypeScript configuration
```

## 🎮 ButtonGame Deployment

The ButtonGame module deploys both the CBGToken (ERC-20) and ButtonGame contracts.

### Deployment Parameters

- `initialTimerDuration`: Timer duration in seconds (default: 300 = 5 minutes)
- `initialEntryFee`: Entry fee in token units with 18 decimals (default: "1000000000000000000" = 1 token)

### Example Deployment

```bash
# Deploy to Alfajores with custom parameters
hardhat ignition deploy ignition/modules/ButtonGame.ts \
  --network alfajores \
  --parameters '{"ButtonGameModule":{"initialTimerDuration":600,"initialEntryFee":"2000000000000000000"}}'
```

After deployment, update your frontend `.env` file with the deployed addresses:

```env
NEXT_PUBLIC_BUTTON_GAME_ADDRESS=0x...
NEXT_PUBLIC_CBG_TOKEN_ADDRESS=0x...
```

## 🔐 Security Notes

- Never commit your `.env` file with real private keys
- Use a dedicated wallet for development/testing
- Test thoroughly on Alfajores before mainnet deployment
- Consider using a hardware wallet for mainnet deployments

## 📚 Learn More

- [Hardhat Documentation](https://hardhat.org/docs)
- [Celo Developer Documentation](https://docs.celo.org)
- [Celo Smart Contract Best Practices](https://docs.celo.org/developer/contractkit)
- [Viem Documentation](https://viem.sh) (Ethereum library used by Hardhat)
