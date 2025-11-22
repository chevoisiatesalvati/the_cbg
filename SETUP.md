# The CBG - Complete Setup Guide

This guide covers all setup steps needed to run The Celo Button Game.

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- A Farcaster account
- A wallet with testnet funds (for contract deployment)

## Quick Start

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables** (see sections below)

3. **Deploy contracts** (see Contract Deployment section)

4. **Start development server:**
   ```bash
   pnpm dev
   ```

## 1. Frontend Environment Setup

### For Local Development (without Farcaster)

If you just want to test the UI locally without Farcaster integration:

```bash
cd apps/web
cp .env.example .env.local
```

Edit `.env.local` and set:
```env
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development
```

The Farcaster variables can remain as placeholders for local testing.

### For Farcaster Mini App Development

**Required for Farcaster integration:**

1. **Start your dev server:**
   ```bash
   pnpm dev
   ```

2. **Expose with ngrok:**
   ```bash
   ngrok http 3000
   ```
   Copy the ngrok URL (e.g., `https://abc123.ngrok-free.app`)

3. **Create environment file:**
   ```bash
   cd apps/web
   cp .env.example .env.local
   ```

4. **Get Farcaster account association:**
   - Visit: https://farcaster.xyz/~/developers/mini-apps/manifest?domain=YOUR_NGROK_URL
   - Sign in with your Farcaster account
   - Sign the manifest
   - Copy the `header`, `payload`, and `signature` values

5. **Update `.env.local`:**
   ```env
   NEXT_PUBLIC_URL=https://abc123.ngrok-free.app
   NEXT_PUBLIC_FARCASTER_HEADER=your-header-here
   NEXT_PUBLIC_FARCASTER_PAYLOAD=your-payload-here
   NEXT_PUBLIC_FARCASTER_SIGNATURE=your-signature-here
   NEXT_PUBLIC_APP_ENV=development
   ```

6. **Restart dev server:**
   ```bash
   pnpm dev
   ```

> **Note:** Farcaster variables are optional for local development but required for Farcaster client integration. See `FARCASTER_SETUP.md` for more details.

## 2. Contract Deployment Setup

### Get Testnet Funds

1. **Get Alfajores testnet funds:**
   - Visit: https://faucet.celo.org
   - Enter your wallet address
   - Request testnet tokens (CELO, cUSD)

### Configure Deployment

1. **Create environment file:**
   ```bash
   cd apps/contracts
   cp .env.example .env
   ```

2. **Add your private key:**
   ```env
   PRIVATE_KEY=your_private_key_without_0x_prefix
   ```
   
   **⚠️ Security Warning:**
   - Never commit `.env` files
   - Use a dedicated wallet for testing
   - Never use your mainnet wallet private key

3. **(Optional) Add Celoscan API key for verification:**
   ```env
   CELOSCAN_API_KEY=your_celoscan_api_key
   ```
   Get from: https://celoscan.io/apis

### Deploy Contracts

1. **Compile contracts:**
   ```bash
   cd apps/contracts
   pnpm compile
   ```

2. **Deploy to Alfajores testnet:**
   ```bash
   pnpm deploy:alfajores
   ```

3. **Copy deployed addresses:**
   The deployment will output addresses like:
   ```
   ButtonGame deployed to: 0x...
   CBGToken deployed to: 0x...
   ```

4. **Update frontend environment:**
   Edit `apps/web/.env.local`:
   ```env
   NEXT_PUBLIC_BUTTON_GAME_ADDRESS=0x...
   NEXT_PUBLIC_CBG_TOKEN_ADDRESS=0x...
   ```

5. **Restart frontend:**
   ```bash
   pnpm dev
   ```

## 3. Environment Variables Summary

### Frontend (`apps/web/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_URL` | Yes | Your app URL (ngrok for dev, domain for prod) |
| `NEXT_PUBLIC_FARCASTER_HEADER` | For Farcaster | Farcaster account association header |
| `NEXT_PUBLIC_FARCASTER_PAYLOAD` | For Farcaster | Farcaster account association payload |
| `NEXT_PUBLIC_FARCASTER_SIGNATURE` | For Farcaster | Farcaster account association signature |
| `NEXT_PUBLIC_BUTTON_GAME_ADDRESS` | Yes (after deploy) | Deployed ButtonGame contract address |
| `NEXT_PUBLIC_CBG_TOKEN_ADDRESS` | Yes (after deploy) | Deployed CBGToken contract address |
| `NEXT_PUBLIC_APP_ENV` | No | `development` or `production` (default: `development`) |
| `JWT_SECRET` | For production | Secure JWT secret for production |

### Contracts (`apps/contracts/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PRIVATE_KEY` | Yes (for deploy) | Wallet private key without 0x prefix |
| `CELOSCAN_API_KEY` | Optional | For contract verification on Celoscan |

## 4. Development Workflow

### Local Development (No Farcaster)

1. Set up frontend env (skip Farcaster vars)
2. Deploy contracts to testnet
3. Add contract addresses to frontend env
4. Run `pnpm dev`
5. Test in browser (wallet connection will work via Wagmi)

### Farcaster Mini App Development

1. Set up ngrok
2. Get Farcaster account association
3. Set up frontend env with Farcaster vars
4. Deploy contracts
5. Add contract addresses
6. Run `pnpm dev`
7. Test in Warpcast/Farcaster client

## 5. Production Deployment

### Frontend

1. Deploy to your hosting platform (Vercel, etc.)
2. Set all environment variables in platform settings
3. Get Farcaster account association for production domain
4. Update `NEXT_PUBLIC_URL` to production domain

### Contracts

1. Deploy to Celo mainnet:
   ```bash
   cd apps/contracts
   pnpm deploy:celo
   ```
2. Update frontend env with mainnet addresses
3. Verify contracts on Celoscan (optional)

## Troubleshooting

### "Contracts not deployed" warning
- Make sure `NEXT_PUBLIC_BUTTON_GAME_ADDRESS` and `NEXT_PUBLIC_CBG_TOKEN_ADDRESS` are set
- Verify addresses are correct (not zero addresses)

### Farcaster connection issues
- Verify all three Farcaster env vars are set
- Check that domain in payload matches your URL
- See `FARCASTER_SETUP.md` for detailed troubleshooting

### Deployment fails
- Check wallet has testnet funds
- Verify `PRIVATE_KEY` is correct (no 0x prefix)
- Check network RPC is accessible

## Additional Resources

- [Farcaster Setup Guide](./FARCASTER_SETUP.md)
- [Contract Deployment Guide](./apps/contracts/README.md)
- [Celo Documentation](https://docs.celo.org)
- [Farcaster Mini Apps Docs](https://miniapps.farcaster.xyz/)

