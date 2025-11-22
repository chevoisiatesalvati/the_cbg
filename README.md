# the_cbg

**The Celo Button Game** - A decentralized timing-based game where players compete to be the last one to press a button before the timer expires, with the winner claiming the prize pool.

A modern Celo blockchain application built with Next.js, TypeScript, and Turborepo.

## About

The Celo Button Game is a smart contract-based game deployed on the Celo blockchain. Players pay an entry fee (or use free play) to press a button that resets a countdown timer. The last player to press the button before the timer expires wins the accumulated prize pool. The game features automatic prize distribution, free play eligibility for new users, and progressive jackpot mechanics.

## Celo Integration

This project integrates with Celo through:

- **Native CELO Token**: The game uses CELO as the native currency for entry fees and prize pools, leveraging Celo's low transaction fees and fast finality
- **Celo Composer Kit**: Built using Celo's Composer Kit for seamless wallet integration and UI components
- **Multi-Network Support**: Deployed and verified on Celo Mainnet and Celo Sepolia testnet using Hardhat with CeloScan API verification
- **Smart Contract Deployment**: Deployed using Hardhat Ignition

The integration leverages Celo's mobile-first approach and low gas fees to create an accessible, engaging gaming experience on-chain.

## Team

**Andrea Salvemini** - Developer
- Telegram: [@MrSaulman](https://t.me/MrSaulman)
- X (Twitter): [@Saul2078](https://x.com/Saul2078)

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment variables (see [SETUP.md](./SETUP.md) for details):
   - Frontend: Copy `apps/web/.env.example` to `apps/web/.env.local`
   - Contracts: Copy `apps/contracts/.env.example` to `apps/contracts/.env`

3. Deploy contracts (see [SETUP.md](./SETUP.md)):
   ```bash
   cd apps/contracts
   pnpm deploy:alfajores
   ```

4. Update frontend `.env.local` with deployed contract addresses

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

> **📖 For detailed setup instructions, see [SETUP.md](./SETUP.md)**

## Project Structure

This is a monorepo managed by Turborepo with the following structure:

- `apps/web` - Next.js application with embedded UI components and utilities
- `apps/hardhat` - Smart contract development environment

## Available Scripts

- `pnpm dev` - Start development servers
- `pnpm build` - Build all packages and apps
- `pnpm lint` - Lint all packages and apps
- `pnpm type-check` - Run TypeScript type checking

### Smart Contract Scripts

- `pnpm contracts:compile` - Compile smart contracts
- `pnpm contracts:test` - Run smart contract tests
- `pnpm contracts:deploy` - Deploy contracts to local network
- `pnpm contracts:deploy:alfajores` - Deploy to Celo Alfajores testnet
- `pnpm contracts:deploy:sepolia` - Deploy to Celo Sepolia testnet
- `pnpm contracts:deploy:celo` - Deploy to Celo mainnet

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Smart Contracts**: Hardhat with Viem
- **Monorepo**: Turborepo
- **Package Manager**: PNPM

## Documentation

- [Complete Setup Guide](./SETUP.md) - Environment variables, deployment, and configuration
- [Farcaster Setup](./FARCASTER_SETUP.md) - Farcaster mini app integration
- [Contract Deployment](./apps/contracts/README.md) - Smart contract deployment guide

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Celo Documentation](https://docs.celo.org/)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Composer Kit Documentation](https://docs.celo.org/composer-kit)
