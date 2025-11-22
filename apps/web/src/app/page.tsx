"use client";

import { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGameState,
  useEntryFee,
  useTimerDuration,
  useInitialPrizePool,
  usePressButton,
  useClaimPrize,
  useFreePlayEligibility,
  useUserBalance,
  useWinners,
  useGameEvents,
} from "@/hooks/use-button-game";
import { formatUnits } from "viem";
import { celoSepolia } from "wagmi/chains";
import { BUTTON_GAME_ADDRESS } from "@/lib/contracts";
import { CeloLogo } from "@/components/celo-logo";

function formatTime(seconds: bigint | number): string {
  const totalSeconds = typeof seconds === "bigint" ? Number(seconds) : seconds;
  if (totalSeconds <= 0) return "00:00";
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function Home() {
  // DEBUG: All console.log statements are prefixed with [DEBUG] for easy filtering
  console.log('[DEBUG] Component render - checking game state');
  
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { gameState, isLoading: gameStateLoading, refetch } = useGameState();
  const { entryFeeFormatted = "0", entryFee } = useEntryFee();
  const { timerDuration, isLoading: timerDurationLoading } = useTimerDuration();
  const { initialPrizePool, initialPrizePoolFormatted, isLoading: initialPrizePoolLoading } = useInitialPrizePool();
  
  // Debug when timerDuration and initialPrizePool load
  useEffect(() => {
    if (!timerDurationLoading && timerDuration !== undefined) {
      console.log('[DEBUG] TimerDuration loaded:', {
        timerDuration: timerDuration.toString(),
        timerDurationSeconds: Number(timerDuration),
        timerDurationMinutes: Number(timerDuration) / 60,
        isZero: timerDuration === 0n,
        warning: timerDuration === 0n ? '⚠️ TIMER DURATION IS ZERO! This will cause immediate timer expiration.' : 'OK',
      });
    }
  }, [timerDuration, timerDurationLoading]);
  
  useEffect(() => {
    if (!initialPrizePoolLoading && initialPrizePool !== undefined) {
      console.log('[DEBUG] InitialPrizePool loaded:', {
        initialPrizePool: initialPrizePool.toString(),
        initialPrizePoolFormatted,
        isZero: initialPrizePool === 0n,
        warning: initialPrizePool === 0n ? '⚠️ INITIAL PRIZE POOL IS ZERO! New games will start with 0 prize pool.' : 'OK',
      });
    }
  }, [initialPrizePool, initialPrizePoolFormatted, initialPrizePoolLoading]);
  
  // Debug game state changes
  useEffect(() => {
    if (gameState) {
      const now = Math.floor(Date.now() / 1000);
      const timerEndTimestamp = Number(gameState.timerEnd);
      const isTimerExpired = now >= timerEndTimestamp;
      
      const timeSinceTimerEnd = now - timerEndTimestamp;
      const expectedNewTimerEnd = timerEndTimestamp + (timerDuration ? Number(timerDuration) : 0);
      
      console.log('[DEBUG] Game state updated:', {
        round: gameState.currentRound.toString(),
        timeRemaining: gameState.timeRemaining.toString(),
        timerEnd: gameState.timerEnd.toString(),
        timerEndDate: new Date(timerEndTimestamp * 1000).toISOString(),
        currentTimestamp: now,
        currentDate: new Date(now * 1000).toISOString(),
        isTimerExpired,
        timeSinceTimerEnd: `${timeSinceTimerEnd} seconds (${Math.floor(timeSinceTimerEnd / 60)} minutes)`,
        prizePool: gameState.prizePool.toString(),
        lastPlayer: gameState.lastPlayer,
        gameActive: gameState.gameActive,
        timerDuration: timerDuration?.toString() || 'loading',
        initialPrizePool: initialPrizePool?.toString() || 'loading',
        initialPrizePoolFormatted: initialPrizePoolFormatted || 'loading',
        expectedNewTimerEnd: timerDuration ? new Date(expectedNewTimerEnd * 1000).toISOString() : 'N/A',
        analysis: isTimerExpired && gameState.prizePool === 0n && (!gameState.lastPlayer || gameState.lastPlayer === "0x0000000000000000000000000000000000000000")
          ? "Prize was claimed, but new game timer not set properly"
          : isTimerExpired && gameState.prizePool > 0n
          ? "Timer expired but prize not claimed yet"
          : "Game is active",
      });
    }
  }, [gameState, timerDuration, initialPrizePool, initialPrizePoolFormatted]);
  const { pressButton, isPending: isPressing, isConfirming, isSuccess: pressSuccess, error: pressError, isUsingFreePlay } = usePressButton();
  const { claimPrize, isPending: isClaiming, isSuccess: claimSuccess, error: claimError } = useClaimPrize();
  const { isEligible: isFreePlayEligible, timeUntilFreePlay } = useFreePlayEligibility();
  const { balance, balanceFormatted } = useUserBalance();
  const { winners, isLoading: winnersLoading } = useWinners(10);

  const [timeRemaining, setTimeRemaining] = useState<bigint>(0n);
  const [notification, setNotification] = useState<string | null>(null);
  const [showWinners, setShowWinners] = useState(false);
  const [lastKnownRound, setLastKnownRound] = useState<bigint | null>(null);

  // Event listeners - refetch on events
  useGameEvents(
    () => {
      refetch();
      setNotification("Button pressed! Timer reset.");
      setTimeout(() => setNotification(null), 5000);
    },
    () => {
      refetch();
      setNotification("Prize claimed! New game started.");
      setTimeout(() => setNotification(null), 5000);
    },
    () => {
      refetch();
      setNotification("New game started!");
      setTimeout(() => setNotification(null), 5000);
    }
  );

  // Calculate time remaining from timerEnd timestamp (single source of truth)
  // This avoids conflicts between contract value and client-side countdown
  useEffect(() => {
    if (!gameState?.timerEnd) {
      setTimeRemaining(0n);
      return;
    }

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const timerEnd = Number(gameState.timerEnd);
      const remaining = BigInt(Math.max(0, timerEnd - now));
      setTimeRemaining(remaining);
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [gameState?.timerEnd, gameState?.currentRound]);

  // Refetch game state after successful press
  useEffect(() => {
    if (pressSuccess) {
      refetch();
    }
  }, [pressSuccess, refetch]);

  // Refetch game state after successful claim to show new game
  useEffect(() => {
    if (claimSuccess) {
      console.log('[DEBUG] Claim successful! Refetching game state in 2 seconds...');
      // Wait for transaction to be confirmed, then refetch
      setTimeout(() => {
        console.log('[DEBUG] Refetching after successful claim');
        refetch();
      }, 2000);
    }
  }, [claimSuccess, refetch]);

  // Refetch game state after claim error to sync UI
  useEffect(() => {
    if (claimError) {
      const errorMsg = claimError.message || String(claimError) || "";
      console.log('[DEBUG] Claim error:', errorMsg);
      // If error is "No prize to claim", refetch to update state
      if (errorMsg.includes("No prize to claim")) {
        console.log('[DEBUG] No prize to claim - refetching in 1 second');
        setTimeout(() => {
          refetch();
        }, 1000);
      }
    }
  }, [claimError, refetch]);

  // Track round changes to detect when new game starts
  useEffect(() => {
    if (gameState?.currentRound) {
      console.log('[DEBUG] Round tracking:', {
        currentRound: gameState.currentRound.toString(),
        lastKnownRound: lastKnownRound?.toString() || 'null',
        timeRemaining: gameState.timeRemaining.toString(),
        prizePool: gameState.prizePool.toString(),
        lastPlayer: gameState.lastPlayer,
      });
      
      if (lastKnownRound === null) {
        console.log('[DEBUG] Setting initial round:', gameState.currentRound.toString());
        setLastKnownRound(gameState.currentRound);
      } else if (gameState.currentRound > lastKnownRound) {
        // Round increased, new game started
        console.log('[DEBUG] Round increased! New game started. Old:', lastKnownRound.toString(), 'New:', gameState.currentRound.toString());
        setLastKnownRound(gameState.currentRound);
        refetch();
      }
    }
  }, [gameState?.currentRound, lastKnownRound, refetch]);

  const prizePoolFormatted = gameState?.prizePool
    ? formatUnits(gameState.prizePool, 18)
    : "0";

  const progressiveJackpotFormatted = gameState?.progressiveJackpot
    ? formatUnits(gameState.progressiveJackpot, 18)
    : "0";

  const hasEnoughBalance = balance && entryFee ? balance >= entryFee : false;
  const isWrongChain = chainId !== celoSepolia.id;

  const canPressButton =
    isConnected &&
    !isWrongChain &&
    gameState?.gameActive &&
    gameState?.timeRemaining > 0n &&
    !isPressing &&
    !isConfirming &&
    (isFreePlayEligible || hasEnoughBalance);

  // Allow claiming if timer expired - this is needed to start a new game
  const canClaimPrize =
    isConnected &&
    !isWrongChain &&
    gameState?.gameActive &&
    gameState?.timeRemaining === 0n &&
    !isClaiming;

  // Debug logging for button states
  useEffect(() => {
    if (gameState) {
      console.log('[DEBUG] Button state check:', {
        isConnected,
        isWrongChain,
        gameActive: gameState.gameActive,
        timeRemaining: gameState.timeRemaining.toString(),
        prizePool: gameState.prizePool.toString(),
        lastPlayer: gameState.lastPlayer,
        currentRound: gameState.currentRound.toString(),
        canPressButton,
        canClaimPrize,
        isFreePlayEligible,
        hasEnoughBalance,
        isPressing,
        isConfirming,
        isClaiming,
      });
    }
  }, [gameState, isConnected, isWrongChain, canPressButton, canClaimPrize, isFreePlayEligible, hasEnoughBalance, isPressing, isConfirming, isClaiming]);

  return (
    <main className="min-h-screen bg-celo-tan-light">
      <div className="container mx-auto px-4 py-4 md:py-6 max-w-6xl">
        {/* Round indicator */}
        {gameState && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 md:mb-6 flex justify-start"
          >
            <div className="bg-celo-green border-2 border-black px-4 py-2">
              <p className="font-inter text-xs font-750 text-white uppercase">
                ROUND #{gameState.currentRound.toString()}
              </p>
            </div>
          </motion.div>
        )}

        {/* Notification - Sharp color block */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="mb-3 p-3 bg-celo-lime border-2 border-black text-black font-inter font-bold text-sm"
            >
              {notification}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Warnings - High contrast blocks - Compact */}
        {isConnected && isWrongChain && (
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="mb-3 p-3 bg-celo-orange border-2 border-black text-black font-inter font-bold text-sm"
          >
            ⚠️ SWITCH TO CELO SEPOLIA TESTNET
          </motion.div>
        )}

        {isConnected && !isWrongChain && BUTTON_GAME_ADDRESS === "0x0000000000000000000000000000000000000000" && (
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="mb-3 p-3 bg-celo-yellow border-2 border-black text-black font-inter font-bold text-sm"
          >
            ⚠️ CONTRACTS NOT DEPLOYED
          </motion.div>
        )}

        {isConnected && !isWrongChain && !hasEnoughBalance && !isFreePlayEligible && (
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="mb-3 p-3 bg-celo-pink border-2 border-black text-black font-inter font-bold text-sm"
          >
            INSUFFICIENT BALANCE: {parseFloat(entryFeeFormatted).toFixed(4)} CELO REQUIRED
          </motion.div>
        )}

        {/* Error Messages - Compact */}
        {pressError && (
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="mb-3 p-3 bg-black text-celo-yellow border-2 border-celo-yellow font-inter font-bold text-sm"
          >
            ERROR: {pressError.message || String(pressError) || "Transaction failed"}
          </motion.div>
        )}
        {claimError && (
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="mb-3 p-3 bg-black text-celo-yellow border-2 border-celo-yellow font-inter font-bold text-sm"
          >
            ERROR: {claimError.message || String(claimError) || "Claim failed"}
            {String(claimError).includes("No prize to claim") && (
              <div className="mt-2 text-xs font-normal">
                The prize has already been claimed. Refreshing game state...
              </div>
            )}
          </motion.div>
        )}

        {/* Main Game Area - Asymmetric layout - Compact */}
        {isConnected && !isWrongChain && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Left Column - Prize Pool - Compact */}
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
                  {gameStateLoading ? (
                    <span className="animate-pulse-strong">...</span>
                  ) : (
                    `${parseFloat(prizePoolFormatted).toFixed(4)}`
                  )}
                </motion.div>
                <div className="font-inter text-sm font-bold uppercase">CELO</div>
                {gameState && gameState.progressiveJackpot > 0n && (
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

            {/* Center Column - Main Button - Compact */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              className="lg:col-span-1 flex flex-col items-center justify-center"
            >
              {/* Timer - Bold block - Compact */}
              <div
                className={`mb-4 border-2 p-3 w-full ${
                  timeRemaining === 0n && canClaimPrize
                    ? "bg-celo-orange text-black border-black"
                    : "bg-black text-celo-yellow border-celo-yellow"
                }`}
              >
                <div className="font-inter text-xs font-750 uppercase tracking-wider mb-1 text-center">
                  {timeRemaining === 0n && canClaimPrize
                    ? "⏰ TIMER EXPIRED - CLAIM PRIZE"
                    : "TIME REMAINING"}
                </div>
                <div className="font-mono text-2xl md:text-3xl font-bold text-center min-h-[2.5rem] flex items-center justify-center">
                  {gameStateLoading ? (
                    <span>--:--</span>
                  ) : timeRemaining === 0n ? (
                    "00:00"
                  ) : (
                    <span className={Number(timeRemaining) <= 10 ? "animate-pulse-strong text-red-600" : ""}>
                      {formatTime(timeRemaining)}
                    </span>
                  )}
                </div>
              </div>

              {/* Main Button - Central, rounded, with CELO logo - Compact */}
              {canPressButton ? (
                <motion.button
                  onClick={pressButton}
                  disabled={isPressing || isConfirming}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative w-48 h-48 md:w-56 md:h-56 rounded-full bg-celo-yellow border-4 border-black flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-all"
                >
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  >
                    <CeloLogo size={90} />
                  </motion.div>
                  {isPressing || isConfirming ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center"
                    >
                      <span className="font-inter font-bold text-white text-sm">PROCESSING...</span>
                    </motion.div>
                  ) : null}
                  {isUsingFreePlay && (
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
                  onClick={claimPrize}
                  disabled={isClaiming}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative w-48 h-48 md:w-56 md:h-56 rounded-full bg-celo-green border-4 border-black flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-all"
                >
                  <span className="font-inter font-bold text-white text-lg uppercase text-center px-4">
                    {isClaiming ? "CLAIMING..." : "CLAIM PRIZE"}
                  </span>
                </motion.button>
              ) : isConnected && !isWrongChain && gameState && !gameState.gameActive ? (
                <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-celo-tan-medium border-4 border-black flex items-center justify-center">
                  <span className="font-inter font-bold text-celo-brown text-sm uppercase text-center px-4">
                    GAME INACTIVE
                  </span>
                </div>
              ) : isConnected && !isWrongChain && gameStateLoading ? (
                <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-celo-tan-medium border-4 border-black flex items-center justify-center">
                  <span className="font-inter font-bold text-celo-brown text-sm uppercase">
                    LOADING...
                  </span>
                </div>
              ) : isConnected && !isWrongChain ? (
                <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-celo-tan-medium border-4 border-black flex items-center justify-center">
                  <span className="font-inter font-bold text-celo-brown text-sm uppercase text-center px-4">
                    {!isFreePlayEligible && !hasEnoughBalance
                      ? "INSUFFICIENT BALANCE"
                      : gameState && gameState.timeRemaining > 0n
                      ? "READY TO PLAY"
                      : "CONNECT WALLET"}
                  </span>
                </div>
              ) : null}

              {/* Free Play Countdown - Compact */}
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

              {/* Last Player Info - Compact */}
              {gameState?.lastPlayer && gameState.lastPlayer !== "0x0000000000000000000000000000000000000000" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 text-center"
                >
                  <div className="font-inter text-xs font-750 uppercase text-celo-brown mb-1">
                    LAST PLAYER
                  </div>
                  <div className="font-mono text-xs">
                    {gameState.lastPlayer.slice(0, 6)}...{gameState.lastPlayer.slice(-4)}
                    {gameState.lastPlayer === address && (
                      <span className="ml-2 text-celo-green font-bold">(YOU)</span>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Game Inactive - Compact */}
              {gameState && !gameState.gameActive && (
                <div className="mt-4 p-3 bg-celo-tan-medium border-2 border-black text-center">
                  <div className="font-inter font-bold text-celo-brown uppercase text-sm">
                    GAME INACTIVE
                  </div>
                </div>
              )}
            </motion.div>

            {/* Right Column - Stats - Compact */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-1 space-y-3"
            >
              <div className="bg-white border-2 border-black p-3">
                <div className="font-inter text-xs font-750 uppercase tracking-wider mb-2 text-celo-brown">
                  ENTRY FEE
                </div>
                <div className="font-alpina text-2xl font-light italic text-celo-purple">
                  {parseFloat(entryFeeFormatted).toFixed(4)} CELO
                </div>
              </div>

              {isConnected && (
                <div className="bg-celo-purple border-2 border-black p-3 text-white">
                  <div className="font-inter text-xs font-750 uppercase tracking-wider mb-2">
                    YOUR BALANCE
                  </div>
                  <div className="font-alpina text-2xl font-light italic">
                    {parseFloat(balanceFormatted).toFixed(4)} CELO
                  </div>
                </div>
              )}

              {/* Winners Toggle - Compact */}
              <button
                onClick={() => setShowWinners(!showWinners)}
                className="w-full bg-celo-blue border-2 border-black p-2 text-black font-inter font-bold uppercase text-sm hover:bg-black hover:text-celo-blue transition-colors"
              >
                {showWinners ? "HIDE" : "SHOW"} WINNERS
              </button>

              {/* Winners List - Compact */}
              <AnimatePresence>
                {showWinners && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white border-2 border-black p-3 overflow-hidden max-h-96 overflow-y-auto"
                  >
                    <div className="font-inter text-xs font-750 uppercase tracking-wider mb-3 text-celo-brown">
                      RECENT WINNERS
                    </div>
                    {winnersLoading ? (
                      <div className="text-center font-inter text-celo-brown text-xs">LOADING...</div>
                    ) : winners && winners.length > 0 ? (
                      <div className="space-y-2">
                        {winners.map((winner, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="border-2 border-black p-2"
                          >
                            <div className="font-inter text-xs font-bold uppercase text-celo-green mb-1">
                              ROUND #{winner.round.toString()}
                            </div>
                            <div className="font-mono text-xs mb-1">
                              {winner.winner.slice(0, 6)}...{winner.winner.slice(-4)}
                            </div>
                            <div className="font-alpina text-base font-light italic text-celo-purple">
                              {parseFloat(formatUnits(winner.prize, 18)).toFixed(4)} CELO
                            </div>
                            <div className="font-inter text-xs text-celo-brown mt-1">
                              {new Date(Number(winner.timestamp) * 1000).toLocaleDateString()}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center font-inter text-celo-brown text-xs">NO WINNERS YET</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}

        {/* Instructions - Structural poster-like layout */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-16 bg-white border-4 border-black p-12"
          >
            <h2 className="font-alpina text-5xl font-light italic text-celo-purple mb-8 tracking-tighter">
              HOW TO <span className="not-italic">PLAY</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { num: "01", text: "Connect your wallet" },
                { num: "02", text: `Get 1 free play every 24 hours, or pay ${parseFloat(entryFeeFormatted).toFixed(4)} CELO` },
                { num: "03", text: "Press the button to reset the timer" },
                { num: "04", text: "If you're last when timer hits zero, claim your prize" },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + idx * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="bg-celo-yellow border-2 border-black p-4 w-16 h-16 flex items-center justify-center">
                    <span className="font-inter font-bold text-lg">{item.num}</span>
                  </div>
                  <div className="flex-1 pt-4">
                    <p className="font-inter font-750 text-celo-brown uppercase text-sm leading-tight">
                      {item.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
