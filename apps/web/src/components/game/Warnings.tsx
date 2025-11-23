"use client";

import { motion } from "framer-motion";
import { useChainId } from "wagmi";
import { getButtonGameAddress } from "@/lib/contracts";

interface ChainWarningProps {
  isConnected: boolean;
  isWrongChain: boolean;
}

export function ChainWarning({ isConnected, isWrongChain }: ChainWarningProps) {
  if (!isConnected || !isWrongChain) return null;

  return (
    <motion.div
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      className="mb-3 p-3 bg-cat-yellow border-2 border-cat-black text-cat-black font-inter font-bold text-sm"
    >
      ⚠️ SWITCH TO CELO MAINNET OR CELO SEPOLIA TESTNET
    </motion.div>
  );
}

interface ContractWarningProps {
  isConnected: boolean;
  isWrongChain: boolean;
}

export function ContractWarning({ isConnected, isWrongChain }: ContractWarningProps) {
  const chainId = useChainId();
  const contractAddress = getButtonGameAddress(chainId);
  
  if (!isConnected || isWrongChain || contractAddress !== "0x0000000000000000000000000000000000000000") {
    return null;
  }

  return (
    <motion.div
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      className="mb-3 p-3 bg-cat-yellow border-2 border-cat-black text-cat-black font-inter font-bold text-sm"
    >
      ⚠️ CONTRACTS NOT DEPLOYED
    </motion.div>
  );
}

interface BalanceWarningProps {
  isConnected: boolean;
  isWrongChain: boolean;
  hasEnoughBalance: boolean;
  isFreePlayEligible: boolean;
  entryFeeFormatted: string;
}

export function BalanceWarning({
  isConnected,
  isWrongChain,
  hasEnoughBalance,
  isFreePlayEligible,
  entryFeeFormatted,
}: BalanceWarningProps) {
  if (!isConnected || isWrongChain || hasEnoughBalance || isFreePlayEligible) {
    return null;
  }

  return (
    <motion.div
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      className="mb-3 p-3 bg-cat-pink border-2 border-cat-black text-cat-black font-inter font-bold text-sm"
    >
      INSUFFICIENT BALANCE: {parseFloat(entryFeeFormatted).toFixed(4)} CELO REQUIRED
    </motion.div>
  );
}

