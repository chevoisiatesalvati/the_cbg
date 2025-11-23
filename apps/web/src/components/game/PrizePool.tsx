"use client";

import { motion } from "framer-motion";
import { formatUnits } from "viem";

interface PrizePoolProps {
  prizePool: bigint;
  progressiveJackpot?: bigint;
  isLoading: boolean;
}

export function PrizePool({ prizePool, progressiveJackpot, isLoading }: PrizePoolProps) {
  const prizePoolFormatted = prizePool ? formatUnits(prizePool, 18) : "0";
  const progressiveJackpotFormatted = progressiveJackpot
    ? formatUnits(progressiveJackpot, 18)
    : "0";

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="lg:col-span-1"
    >
      <div className="bg-celo-green border-2 border-black p-4 text-white">
        <div className="font-inter text-xs font-750 uppercase tracking-wider mb-2">
          PRIZE POOL
        </div>
        <motion.div
          key={prizePoolFormatted}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="font-alpina text-3xl md:text-4xl font-light italic mb-1"
        >
          {isLoading ? (
            <span className="animate-pulse-strong">...</span>
          ) : (
            `${parseFloat(prizePoolFormatted).toFixed(4)}`
          )}
        </motion.div>
        <div className="font-inter text-sm font-bold uppercase">CELO</div>
        {progressiveJackpot && progressiveJackpot > 0n && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 pt-3 border-t-2 border-white"
          >
            <div className="font-inter text-xs font-750 uppercase tracking-wider mb-1">
              JACKPOT
            </div>
            <div className="font-alpina text-xl font-light italic">
              {parseFloat(progressiveJackpotFormatted).toFixed(4)} CELO
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

