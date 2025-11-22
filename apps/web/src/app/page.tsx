"use client";

import { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { Wallet, Connect, Avatar, Name } from "@composer-kit/ui/wallet";
import {
  useGameState,
  useEntryFee,
  usePressButton,
  useClaimPrize,
} from "@/hooks/use-button-game";
import { formatUnits } from "viem";
import { celoSepolia } from "wagmi/chains";
import { BUTTON_GAME_ADDRESS } from "@/lib/contracts";

function formatTime(seconds: bigint): string {
  const totalSeconds = Number(seconds);
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
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { gameState, isLoading: gameStateLoading, refetch } = useGameState();
  const { entryFeeFormatted = "0" } = useEntryFee();
  const { pressButton, isPending: isPressing, isConfirming, isSuccess: pressSuccess } = usePressButton();
  const { claimPrize, isPending: isClaiming } = useClaimPrize();

  const [timeRemaining, setTimeRemaining] = useState<bigint>(0n);

  // Poll game state every second
  useEffect(() => {
    if (!gameState) return;

    const interval = setInterval(() => {
      if (gameState.timeRemaining > 0n) {
        setTimeRemaining((prev) => {
          const newTime = prev > 0n ? prev - 1n : 0n;
          if (newTime === 0n) {
            refetch();
          }
          return newTime;
        });
      } else {
        setTimeRemaining(0n);
      }
      refetch();
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, refetch]);

  // Update time remaining when game state changes
  useEffect(() => {
    if (gameState?.timeRemaining) {
      setTimeRemaining(gameState.timeRemaining);
    }
  }, [gameState?.timeRemaining]);

  // Refetch game state after successful press
  useEffect(() => {
    if (pressSuccess) {
      refetch();
    }
  }, [pressSuccess, refetch]);

  const prizePoolFormatted = gameState?.prizePool
    ? formatUnits(gameState.prizePool, 18)
    : "0";

  const canPressButton =
    isConnected &&
    gameState?.gameActive &&
    gameState?.timeRemaining > 0n &&
    !isPressing &&
    !isConfirming;

  const canClaimPrize =
    isConnected &&
    gameState?.gameActive &&
    gameState?.timeRemaining === 0n &&
    gameState?.prizePool > 0n &&
    !isClaiming;

  const isWrongChain = chainId !== celoSepolia.id;

  return (
    <main className="flex-1 min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            🎮 The CBG
          </h1>
          <p className="text-lg text-gray-600">
            The Celo Button Game
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="mb-6 flex justify-center [&_button]:bg-blue-600 [&_button]:hover:bg-blue-700 [&_button]:text-white [&_button]:font-semibold [&_button]:px-6 [&_button]:py-3 [&_button]:rounded-lg [&_button]:transition-colors">
          <Wallet>
            <Connect label="Connect Wallet">
              <Avatar />
              <Name />
            </Connect>
          </Wallet>
        </div>

        {/* Wrong Chain Warning */}
        {isConnected && isWrongChain && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
            ⚠️ Please switch to Celo Sepolia testnet
          </div>
        )}

        {/* Contract Not Deployed Warning */}
        {isConnected && !isWrongChain && BUTTON_GAME_ADDRESS === "0x0000000000000000000000000000000000000000" && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg text-center">
            ⚠️ Contracts not deployed. Please set NEXT_PUBLIC_BUTTON_GAME_ADDRESS and NEXT_PUBLIC_CBG_TOKEN_ADDRESS environment variables.
          </div>
        )}

        {/* Game Card */}
        {isConnected && !isWrongChain && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-6">
            {/* Prize Pool Display */}
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Current Prize Pool</div>
              <div className="text-4xl md:text-5xl font-bold text-orange-600 mb-1">
                {gameStateLoading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  `${parseFloat(prizePoolFormatted).toFixed(4)} CELO`
                )}
              </div>
              <div className="text-xs text-gray-500">
                Entry fee: {parseFloat(entryFeeFormatted).toFixed(4)} CELO
              </div>
            </div>

            {/* Timer Display */}
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Time Remaining</div>
              <div className="text-3xl md:text-4xl font-mono font-bold text-gray-900">
                {gameStateLoading ? (
                  <span className="animate-pulse">--:--</span>
                ) : (
                  formatTime(timeRemaining)
                )}
              </div>
              {gameState?.timeRemaining === 0n && gameState?.prizePool > 0n && (
                <div className="mt-2 text-sm text-orange-600 font-semibold">
                  ⏰ Timer expired! Last player can claim prize
                </div>
              )}
            </div>

            {/* Last Player */}
            {gameState?.lastPlayer && gameState.lastPlayer !== "0x0000000000000000000000000000000000000000" && (
              <div className="text-center text-sm text-gray-600">
                Last player: {gameState.lastPlayer.slice(0, 6)}...{gameState.lastPlayer.slice(-4)}
              </div>
            )}

            {/* Press Button */}
            <button
              onClick={() => pressButton()}
              disabled={!canPressButton}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-6 px-8 rounded-xl text-2xl md:text-3xl transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg disabled:shadow-none"
            >
              {isPressing || isConfirming
                ? "Processing..."
                : gameState?.timeRemaining === 0n
                ? "Timer Expired"
                : "🎯 PRESS BUTTON"}
            </button>

            {/* Claim Prize Button */}
            {canClaimPrize && (
              <button
                onClick={() => claimPrize()}
                disabled={isClaiming}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors disabled:cursor-not-allowed"
              >
                {isClaiming ? "Claiming..." : "🏆 Claim Prize"}
              </button>
            )}

            {/* Loading State */}
            {gameStateLoading && (
              <div className="text-center text-gray-500">
                Loading game state...
              </div>
            )}

            {/* Game Inactive */}
            {gameState && !gameState.gameActive && (
              <div className="text-center p-4 bg-gray-100 rounded-lg text-gray-600">
                Game is currently inactive
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {!isConnected && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">How to Play</h2>
            <div className="space-y-3 text-left text-gray-600">
              <div className="flex items-start gap-3">
                <span className="text-2xl">1️⃣</span>
                <p>Connect your wallet using the button above</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">2️⃣</span>
                <p>Press the button to reset the timer and add CELO to the prize pool</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">3️⃣</span>
                <p>If you&apos;re the last player when the timer hits zero, claim your prize!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
