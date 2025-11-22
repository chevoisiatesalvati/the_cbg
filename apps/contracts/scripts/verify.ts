import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';
import hre from 'hardhat';

/**
 * Verify contract on CeloScan/BlockScout
 * Usage: npx hardhat run scripts/verify.ts --network <network>
 */

async function main() {
  // Read the network from hardhat config
  const network = hre.network.name;
  
  // Get chain ID from network
  const chainId = hre.network.config.chainId;
  if (!chainId) {
    throw new Error(`Chain ID not found for network: ${network}`);
  }

  try {
    // Find the most recent deployment
    // Check both chain-specific folder and deployment-* folders, use the most recent one
    const deploymentsDir = './ignition/deployments';
    let deploymentPath: string | null = null;
    let deploymentData: any = null;
    let latestTimestamp = 0;
    
    // First, check chain-specific folder
    const chainSpecificPath = `${deploymentsDir}/chain-${chainId}/deployed_addresses.json`;
    if (existsSync(chainSpecificPath)) {
      const stats = statSync(chainSpecificPath);
      if (stats.mtimeMs > latestTimestamp) {
        latestTimestamp = stats.mtimeMs;
        deploymentPath = chainSpecificPath;
        deploymentData = JSON.parse(readFileSync(chainSpecificPath, 'utf-8'));
      }
    }
    
    // Then, check all deployment-* folders and find the most recent one
    if (existsSync(deploymentsDir)) {
      const entries = readdirSync(deploymentsDir, { withFileTypes: true });
      const deploymentDirs = entries
        .filter(entry => entry.isDirectory() && entry.name.startsWith('deployment-'))
        .map(entry => entry.name);
      
      for (const dir of deploymentDirs) {
        const candidatePath = join(deploymentsDir, dir, 'deployed_addresses.json');
        if (existsSync(candidatePath)) {
          const stats = statSync(candidatePath);
          if (stats.mtimeMs > latestTimestamp) {
            const candidateData = JSON.parse(readFileSync(candidatePath, 'utf-8'));
            if (candidateData['ButtonGameModule#ButtonGame']) {
              latestTimestamp = stats.mtimeMs;
              deploymentPath = candidatePath;
              deploymentData = candidateData;
            }
          }
        }
      }
    }
    
    if (!deploymentPath || !deploymentData) {
      throw new Error(
        `No deployment files found. Please deploy the contract first using: pnpm deploy:${network}`
      );
    }
    
    const contractAddress = deploymentData['ButtonGameModule#ButtonGame'];

    if (!contractAddress) {
      console.error('❌ Contract address not found in deployment file');
      console.error(`   Checked: ${deploymentPath}`);
      process.exit(1);
    }
    
    console.log(`📦 Using deployment from: ${deploymentPath}`);

    console.log(`🔍 Verifying contract at ${contractAddress} on ${network}...`);

    // Get deployer address (the account that deployed)
    const walletClients = await hre.viem.getWalletClients();
    const deployerAddress = walletClients[0].account.address;

    // Constructor arguments (matching ButtonGame.ts defaults)
    const initialTimerDuration = "300"; // 5 minutes
    const initialEntryFee = "10000000000000000"; // 0.01 CELO
    const initialPrizePool = "5000000000000000000"; // 5 CELO

    // Run the verification command with constructor args
    const command = `npx hardhat verify --network ${network} ${contractAddress} ${deployerAddress} ${initialTimerDuration} ${initialEntryFee} ${initialPrizePool}`;

    console.log(`\n📝 Constructor Arguments:`);
    console.log(`  - initialOwner: ${deployerAddress}`);
    console.log(`  - initialTimerDuration: ${initialTimerDuration}`);
    console.log(`  - initialEntryFee: ${initialEntryFee}`);
    console.log(`  - initialPrizePool: ${initialPrizePool}\n`);

    execSync(command, { stdio: 'inherit' });

    console.log('\n✅ Verification complete!');
    console.log(`🔗 View on explorer: ${getExplorerUrl(network, contractAddress)}`);
  } catch (error: any) {
    if (error.message?.includes('Already Verified') || error.stdout?.includes('Already Verified')) {
      console.log('\n✅ Contract is already verified!');
    } else {
      console.error('❌ Verification failed:', error.message || error);
      process.exit(1);
    }
  }
}

function getExplorerUrl(network: string, address: string): string {
  const urls: Record<string, string> = {
    celo: `https://celoscan.io/address/${address}`,
    alfajores: `https://alfajores.celoscan.io/address/${address}`,
    sepolia: `https://celo-sepolia.blockscout.com/address/${address}`,
  };
  return urls[network] || `https://explorer.celo.org/address/${address}`;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

