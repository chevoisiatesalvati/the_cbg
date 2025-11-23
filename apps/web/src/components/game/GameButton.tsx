"use client";

import { motion } from "framer-motion";
import { CeloLogo } from "@/components/celo-logo";
import { formatTime } from "@/lib/app-utils";
import { GameTimer } from "./GameTimer";

interface GameButtonProps {
  canPressButton: boolean;
  canClaimPrize: boolean;
  isPressing: boolean;
  isConfirming: boolean;
  isClaiming: boolean;
  isClaimConfirming: boolean;
  isUsingFreePlay: boolean;
  isFreePlayEligible: boolean;
  hasEnoughBalance: boolean;
  timeUntilFreePlay: number | null;
  gameStateLoading: boolean;
  gameActive: boolean;
  timeRemaining: bigint;
  onPressButton: () => void;
  onClaimPrize: () => void;
}

export function GameButton({
  canPressButton,
  canClaimPrize,
  isPressing,
  isConfirming,
  isClaiming,
  isClaimConfirming,
  isUsingFreePlay,
  isFreePlayEligible,
  hasEnoughBalance,
  timeUntilFreePlay,
  gameStateLoading,
  gameActive,
  timeRemaining,
  onPressButton,
  onClaimPrize,
}: GameButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
      className="lg:col-span-1 flex flex-col items-center justify-center"
    >
      <GameTimer
        timeRemaining={timeRemaining}
        canClaimPrize={canClaimPrize}
        isLoading={gameStateLoading}
      />

      {/* Show loading spinner when transaction is in progress or game state is loading */}
      {gameStateLoading || isPressing || isConfirming ? (
        <motion.button
          disabled
          className="relative w-48 h-48 md:w-56 md:h-56 rounded-full bg-cat-yellow border-4 border-cat-black flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[6px_6px_0_0_rgba(35,31,32,1)] transition-all"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-cat-black bg-opacity-50 rounded-full flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-cat-white border-t-transparent rounded-full"
            />
          </motion.div>
        </motion.button>
      ) : isClaiming || isClaimConfirming ? (
        <motion.button
          disabled
          className="relative w-48 h-48 md:w-56 md:h-56 rounded-full bg-cat-darkPink border-4 border-cat-black flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[6px_6px_0_0_rgba(35,31,32,1)] transition-all"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-cat-yellow border-t-transparent rounded-full"
          />
        </motion.button>
      ) : canPressButton ? (
        <motion.button
          onClick={onPressButton}
          disabled={isPressing || isConfirming}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-48 h-48 md:w-56 md:h-56 rounded-full bg-cat-yellow border-4 border-cat-black flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[6px_6px_0_0_rgba(35,31,32,1)] hover:shadow-[3px_3px_0_0_rgba(35,31,32,1)] transition-all"
        >
          {isPressing || isConfirming ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-cat-black bg-opacity-50 rounded-full flex items-center justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-cat-white border-t-transparent rounded-full"
              />
            </motion.div>
          ) : (
            <>
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              >
                <CeloLogo size={90} />
              </motion.div>
              {isUsingFreePlay && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-2 right-2 bg-cat-pink border-2 border-cat-black px-2 py-0.5 rounded-full shadow-[2px_2px_0_0_rgba(35,31,32,1)]"
                >
                  <span className="font-inter font-bold text-cat-black text-[10px] uppercase leading-tight">
                    FREE
                  </span>
                </motion.div>
              )}
            </>
          )}
        </motion.button>
      ) : canClaimPrize ? (
        <motion.button
          onClick={onClaimPrize}
          disabled={isClaiming}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-48 h-48 md:w-56 md:h-56 rounded-full bg-cat-darkPink border-4 border-cat-black flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[6px_6px_0_0_rgba(35,31,32,1)] hover:shadow-[3px_3px_0_0_rgba(35,31,32,1)] transition-all"
        >
          {isClaiming ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-cat-yellow border-t-transparent rounded-full"
            />
          ) : (
            <span className="font-inter font-bold text-cat-yellow text-lg uppercase text-center px-4">
              CLAIM PRIZE
            </span>
          )}
        </motion.button>
      ) : !gameActive ? (
        <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-cat-darkPink border-4 border-cat-black flex items-center justify-center">
          <span className="font-inter font-bold text-cat-yellow text-sm uppercase text-center px-4">
            GAME INACTIVE
          </span>
        </div>
      ) : null}

      {!isFreePlayEligible && timeUntilFreePlay !== null && timeUntilFreePlay > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-center"
        >
          <div className="font-inter text-xs font-750 uppercase text-cat-black">
            NEXT FREE: {formatTime(timeUntilFreePlay)}
          </div>
        </motion.div>
      )}

      {!gameActive && (
        <div className="mt-4 p-3 bg-cat-darkPink border-2 border-cat-black text-center">
          <div className="font-inter font-bold text-cat-yellow uppercase text-sm">
            GAME INACTIVE
          </div>
        </div>
      )}
    </motion.div>
  );
}

