"use client";

import { motion, AnimatePresence } from "framer-motion";
import { formatUnits } from "viem";
import { useState } from "react";
import type { WinnerInfo } from "@/hooks/use-button-game";
import { EnsAddress } from "@/components/ens/EnsAddress";

interface WinnersListProps {
  winners: WinnerInfo[] | undefined;
  isLoading: boolean;
}

export function WinnersList({ winners, isLoading }: WinnersListProps) {
  const [showWinners, setShowWinners] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowWinners(!showWinners)}
        className="w-full bg-cat-yellow border-2 border-cat-black p-2 text-cat-black font-inter font-bold uppercase text-sm hover:bg-cat-black hover:text-cat-yellow transition-colors"
      >
        {showWinners ? "HIDE" : "SHOW"} WINNERS
      </button>

      <AnimatePresence>
        {showWinners && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-cat-white border-2 border-cat-black p-3 overflow-hidden max-h-96 overflow-y-auto"
          >
            <div className="font-inter text-xs font-750 uppercase tracking-wider mb-3 text-cat-black">
              RECENT WINNERS
            </div>
            {isLoading ? (
              <div className="text-center font-inter text-cat-black text-xs">LOADING...</div>
            ) : winners && winners.length > 0 ? (
              <div className="space-y-2">
                {winners.map((winner, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-2 border-cat-black p-2"
                  >
                    <div className="font-inter text-xs font-bold uppercase text-cat-darkPink mb-1">
                      ROUND #{winner.round.toString()}
                    </div>
                    <div className="mb-1">
                      <EnsAddress
                        address={winner.winner}
                        showAvatar={true}
                        avatarSize={20}
                        showAddress={true}
                      />
                    </div>
                    <div className="font-alpina text-base font-light italic text-cat-black">
                      {parseFloat(formatUnits(winner.prize, 18)).toFixed(4)} CELO
                    </div>
                    <div className="font-inter text-xs text-cat-black mt-1">
                      {new Date(Number(winner.timestamp) * 1000).toLocaleDateString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center font-inter text-cat-black text-xs">NO WINNERS YET</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

