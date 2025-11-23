"use client";

import { motion } from "framer-motion";

interface RoundIndicatorProps {
  currentRound: bigint;
}

export function RoundIndicator({ currentRound }: RoundIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-4 md:mb-6 flex justify-start"
    >
      <div className="bg-cat-white border-4 border-cat-black px-4 py-2">
        <p className="font-inter text-xs font-750 text-cat-black uppercase">
          ROUND #{currentRound.toString()}
        </p>
      </div>
    </motion.div>
  );
}

