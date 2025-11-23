"use client";

import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { useWinners } from "@/hooks/use-button-game";
import { EnsAddress } from "@/components/ens/EnsAddress";
import { formatUnits } from "viem";

interface PlayerProfileProps {
  address?: `0x${string}` | string;
}

export function PlayerProfile({ address: propAddress }: PlayerProfileProps) {
  const { address: connectedAddress } = useAccount();
  const address = propAddress || connectedAddress;
  const { winners, isLoading } = useWinners(100); // Get more winners to calculate stats

  if (!address) {
    return null;
  }

  // Calculate player stats
  const playerWins = winners?.filter(
    (winner) => winner.winner.toLowerCase() === address.toLowerCase()
  ) || [];
  const totalPrizes = playerWins.reduce(
    (sum, win) => sum + win.prize,
    0n
  );
  const winCount = playerWins.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-celo-purple border-2 border-black p-4 text-white"
    >
      <div className="font-inter text-xs font-750 uppercase tracking-wider mb-3">
        YOUR STATS
      </div>

      <div className="flex items-center gap-3 mb-4">
        <EnsAddress
          address={address}
          showAvatar={true}
          avatarSize={48}
          showAddress={false}
          className="justify-start"
        />
      </div>

      {isLoading ? (
        <div className="text-xs text-white opacity-70">Loading stats...</div>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-inter text-xs uppercase opacity-80">Wins:</span>
            <span className="font-alpina text-lg font-light italic">{winCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-inter text-xs uppercase opacity-80">Total Prizes:</span>
            <span className="font-alpina text-lg font-light italic">
              {parseFloat(formatUnits(totalPrizes, 18)).toFixed(4)} CELO
            </span>
          </div>
          {winCount > 0 && (
            <div className="flex justify-between items-center">
              <span className="font-inter text-xs uppercase opacity-80">Avg Prize:</span>
              <span className="font-alpina text-base font-light italic">
                {parseFloat(formatUnits(totalPrizes / BigInt(winCount), 18)).toFixed(4)} CELO
              </span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

