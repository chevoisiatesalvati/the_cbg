"use client";

import { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { Wallet, Connect, Avatar, Name } from "@composer-kit/ui/wallet";
import {
  useGameState,
  useEntryFee,
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
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { gameState, isLoading: gameStateLoading, refetch } = useGameState();
  const { entryFeeFormatted = "0", entryFee } = useEntryFee();
  const { pressButton, isPending: isPressing, isConfirming, isSuccess: pressSuccess, error: pressError } = usePressButton();
  const { claimPrize, isPending: isClaiming, error: claimError } = useClaimPrize();
  const { isEligible: isFreePlayEligible, timeUntilFreePlay } = useFreePlayEligibility();
  const { balance, balanceFormatted } = useUserBalance();
  const { winners, isLoading: winnersLoading } = useWinners(10);

  const [timeRemaining, setTimeRemaining] = useState<bigint>(0n);
  const [notification, setNotification] = useState<string | null>(null);
  const [showWinners, setShowWinners] = useState(false);

  // Event listeners - refetch on events
  useGameEvents(
    () => {
      refetch();
      setNotification("🎉 Button pressed! Timer reset.");
      setTimeout(() => setNotification(null), 5000);
    },
    () => {
      refetch();
      setNotification("🏆 Prize claimed! New game started.");
      setTimeout(() => setNotification(null), 5000);
    },
    () => {
      refetch();
      setNotification("🆕 New game started!");
      setTimeout(() => setNotification(null), 5000);
    }
  );

  // Update time remaining when game state changes
  useEffect(() => {
    if (gameState?.timeRemaining) {
      setTimeRemaining(gameState.timeRemaining);
    }
  }, [gameState?.timeRemaining]);

  // Client-side countdown
  useEffect(() => {
    if (!gameState || gameState.timeRemaining === 0n) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1n) {
          refetch();
          return 0n;
        }
        return prev - 1n;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, refetch]);

  // Refetch game state after successful press
  useEffect(() => {
    if (pressSuccess) {
      refetch();
    }
  }, [pressSuccess, refetch]);

  const prizePoolFormatted = gameState?.prizePool
    ? formatUnits(gameState.prizePool, 18)
    : "0";

  const progressiveJackpotFormatted = gameState?.progressiveJackpot
    ? formatUnits(gameState.progressiveJackpot, 18)
    : "0";

  const hasEnoughBalance = balance && entryFee ? balance >= entryFee : false;

  const canPressButton =
    isConnected &&
    gameState?.gameActive &&
    gameState?.timeRemaining > 0n &&
    !isPressing &&
    !isConfirming;

  const canPressFree =
    canPressButton && isFreePlayEligible;

  const canPressPaid =
    canPressButton && hasEnoughBalance;

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
          {gameState && (
            <p className="text-sm text-gray-500 mt-2">
              Round #{gameState.currentRound.toString()}
            </p>
          )}
        </div>

        {/* Notification */}
        {notification && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center animate-fade-in">
            {notification}
          </div>
        )}

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
            ⚠️ Contracts not deployed. Please set NEXT_PUBLIC_BUTTON_GAME_ADDRESS environment variable.
          </div>
        )}

        {/* Balance Warning */}
        {isConnected && !isWrongChain && !hasEnoughBalance && !isFreePlayEligible && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg text-center">
            ⚠️ Insufficient balance. You need {parseFloat(entryFeeFormatted).toFixed(4)} CELO to play. You have {parseFloat(balanceFormatted).toFixed(4)} CELO.
          </div>
        )}

        {/* Error Messages */}
        {pressError && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
            ❌ Error: {pressError.message || "Transaction failed"}
          </div>
        )}
        {claimError && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
            ❌ Error: {claimError.message || "Claim failed"}
          </div>
        )}

        {/* Game Card */}
        {isConnected && !isWrongChain && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-6">
            {/* Progressive Jackpot */}
            {gameState && gameState.progressiveJackpot > 0n && (
              <div className="text-center p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Progressive Jackpot</div>
                <div className="text-2xl font-bold text-purple-600">
                  {parseFloat(progressiveJackpotFormatted).toFixed(4)} CELO
                </div>
              </div>
            )}

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
                  ⏰ Timer expired! {gameState.lastPlayer === address ? "You can claim your prize!" : "Last player can claim prize"}
                </div>
              )}
            </div>

            {/* Last Player */}
            {gameState?.lastPlayer && gameState.lastPlayer !== "0x0000000000000000000000000000000000000000" && (
              <div className="text-center text-sm text-gray-600">
                Last player: {gameState.lastPlayer.slice(0, 6)}...{gameState.lastPlayer.slice(-4)}
                {gameState.lastPlayer === address && (
                  <span className="ml-2 text-green-600 font-semibold">(You!)</span>
                )}
              </div>
            )}

            {/* Free Play Button */}
            {canPressFree && (
              <button
                onClick={() => pressButton(true)}
                disabled={isPressing || isConfirming}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors disabled:cursor-not-allowed"
              >
                {isPressing || isConfirming ? "Processing..." : "🎁 FREE PLAY (1 per day)"}
              </button>
            )}

            {/* Free Play Info */}
            {!isFreePlayEligible && timeUntilFreePlay !== null && timeUntilFreePlay > 0 && (
              <div className="text-center text-sm text-gray-500">
                Next free play in: {formatTime(timeUntilFreePlay)}
              </div>
            )}

            {/* Press Button (Paid) */}
            {canPressPaid && (
              <button
                onClick={() => pressButton(false)}
                disabled={isPressing || isConfirming}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-6 px-8 rounded-xl text-2xl md:text-3xl transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg disabled:shadow-none"
              >
                {isPressing || isConfirming
                  ? "Processing..."
                  : gameState?.timeRemaining === 0n
                  ? "Timer Expired"
                  : "🎯 PRESS BUTTON"}
              </button>
            )}

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

            {/* Winners Toggle */}
            <div className="text-center">
              <button
                onClick={() => setShowWinners(!showWinners)}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                {showWinners ? "Hide" : "Show"} Winner History
              </button>
            </div>

            {/* Winners List */}
            {showWinners && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Recent Winners</h3>
                {winnersLoading ? (
                  <div className="text-center text-gray-500">Loading...</div>
                ) : winners && winners.length > 0 ? (
                  <div className="space-y-2">
                    {winners.map((winner, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-white rounded">
                        <div>
                          <div className="font-medium">
                            Round #{winner.round.toString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            {winner.winner.slice(0, 6)}...{winner.winner.slice(-4)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            {parseFloat(formatUnits(winner.prize, 18)).toFixed(4)} CELO
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(Number(winner.timestamp) * 1000).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">No winners yet</div>
                )}
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
                <p>Get 1 free play every 24 hours, or pay {parseFloat(entryFeeFormatted).toFixed(4)} CELO to play</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">3️⃣</span>
                <p>Press the button to reset the timer and add CELO to the prize pool</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">4️⃣</span>
                <p>If you&apos;re the last player when the timer hits zero, claim your prize!</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">5️⃣</span>
                <p>New games start automatically with an initial prize pool</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
