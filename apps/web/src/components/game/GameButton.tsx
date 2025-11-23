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
  isUsingFreePlay: boolean;
  isFreePlayEligible: boolean;
  hasEnoughBalance: boolean;
  timeUntilFreePlay: number | null;
  gameStateLoading: boolean;
  gameActive: boolean;
  timeRemaining: bigint;
  lastPlayer: string | null;
  address: string | undefined;
  onPressButton: () => void;
  onClaimPrize: () => void;
}

export function GameButton({
  canPressButton,
  canClaimPrize,
  isPressing,
  isConfirming,
  isClaiming,
  isUsingFreePlay,
  isFreePlayEligible,
  hasEnoughBalance,
  timeUntilFreePlay,
  gameStateLoading,
  gameActive,
  timeRemaining,
  lastPlayer,
  address,
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

      {/* Show loading spinner when transaction is in progress, even if canPressButton is false */}
      {isPressing || isConfirming ? (
        <motion.button
          disabled
          className="relative w-48 h-48 md:w-56 md:h-56 rounded-full bg-celo-yellow border-4 border-black flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"
            />
          </motion.div>
        </motion.button>
      ) : canPressButton ? (
        <motion.button
          onClick={onPressButton}
          disabled={isPressing || isConfirming}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-48 h-48 md:w-56 md:h-56 rounded-full bg-celo-yellow border-4 border-black flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-all"
        >
          {isPressing || isConfirming ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"
              />
            </motion.div>
          ) : (
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            >
              <CeloLogo size={90} />
            </motion.div>
          )}
          {isUsingFreePlay && !isPressing && !isConfirming && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-celo-lime border-2 border-black px-3 py-1"
            >
              <span className="font-inter text-xs font-bold uppercase">FREE PLAY</span>
            </motion.div>
          )}
        </motion.button>
      ) : canClaimPrize ? (
        <motion.button
          onClick={onClaimPrize}
          disabled={isClaiming}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-48 h-48 md:w-56 md:h-56 rounded-full bg-celo-green border-4 border-black flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-all"
        >
          {isClaiming ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"
            />
          ) : (
            <span className="font-inter font-bold text-white text-lg uppercase text-center px-4">
              CLAIM PRIZE
            </span>
          )}
        </motion.button>
      ) : !gameActive ? (
        <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-celo-tan-medium border-4 border-black flex items-center justify-center">
          <span className="font-inter font-bold text-celo-brown text-sm uppercase text-center px-4">
            GAME INACTIVE
          </span>
        </div>
      ) : gameStateLoading ? (
        <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-celo-tan-medium border-4 border-black flex items-center justify-center">
          <span className="font-inter font-bold text-celo-brown text-sm uppercase">
            LOADING...
          </span>
        </div>
      ) : (
        <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-celo-tan-medium border-4 border-black flex items-center justify-center">
          <span className="font-inter font-bold text-celo-brown text-sm uppercase text-center px-4">
            {!isFreePlayEligible && !hasEnoughBalance
              ? "INSUFFICIENT BALANCE"
              : timeRemaining > 0n
              ? "READY TO PLAY"
              : "CONNECT WALLET"}
          </span>
        </div>
      )}

      {!isFreePlayEligible && timeUntilFreePlay !== null && timeUntilFreePlay > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-center"
        >
          <div className="font-inter text-xs font-750 uppercase text-celo-brown">
            NEXT FREE: {formatTime(timeUntilFreePlay)}
          </div>
        </motion.div>
      )}

      {lastPlayer && lastPlayer !== "0x0000000000000000000000000000000000000000" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-center"
        >
          <div className="font-inter text-xs font-750 uppercase text-celo-brown mb-1">
            LAST PLAYER
          </div>
          <div className="font-mono text-xs">
            {lastPlayer.slice(0, 6)}...{lastPlayer.slice(-4)}
            {lastPlayer === address && (
              <span className="ml-2 text-celo-green font-bold">(YOU)</span>
            )}
          </div>
        </motion.div>
      )}

      {!gameActive && (
        <div className="mt-4 p-3 bg-celo-tan-medium border-2 border-black text-center">
          <div className="font-inter font-bold text-celo-brown uppercase text-sm">
            GAME INACTIVE
          </div>
        </div>
      )}
    </motion.div>
  );
}

