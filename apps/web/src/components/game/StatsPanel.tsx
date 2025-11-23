"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StatsPanelProps {
  entryFeeFormatted: string;
  isConnected: boolean;
  balanceFormatted: string;
  lastPlays?: ReactNode;
  children?: ReactNode;
}

export function StatsPanel({ entryFeeFormatted, isConnected, balanceFormatted, lastPlays, children }: StatsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className="lg:col-span-1 space-y-3"
    >
      {lastPlays}

      <div className="bg-cat-white border-4 border-cat-black p-3">
        <div className="font-inter text-xs font-750 uppercase tracking-wider mb-2 text-cat-black">
          ENTRY FEE
        </div>
        <div className="font-alpina text-2xl font-light italic">
          {parseFloat(entryFeeFormatted).toFixed(4)} CELO
        </div>
      </div>

      {isConnected && (
        <div className="bg-cat-white border-4 border-cat-black p-3 text-cat-black">
          <div className="font-inter text-xs font-750 uppercase tracking-wider mb-2">
            YOUR BALANCE
          </div>
          <div className="font-alpina text-2xl font-light italic">
            {parseFloat(balanceFormatted).toFixed(4)} CELO
          </div>
        </div>
      )}

      {children}
    </motion.div>
  );
}

