"use client";

import { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { toast } from "react-toastify";
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
import { celoSepolia } from "wagmi/chains";
import { RoundIndicator } from "@/components/game/RoundIndicator";
import { ChainWarning, ContractWarning, BalanceWarning } from "@/components/game/Warnings";
import { PrizePool } from "@/components/game/PrizePool";
import { GameButton } from "@/components/game/GameButton";
import { StatsPanel } from "@/components/game/StatsPanel";
import { WinnersList } from "@/components/game/WinnersList";
import { Instructions } from "@/components/game/Instructions";
import { BUTTON_GAME_ADDRESS } from "@/lib/contracts";

export default function Home() {
  // Debug: Log contract address on component mount
  useEffect(() => {
    console.log("[DEBUG] Home Component - Contract Address:", {
      contractAddress: BUTTON_GAME_ADDRESS,
      envVar: process.env.NEXT_PUBLIC_BUTTON_GAME_ADDRESS,
      isZeroAddress: BUTTON_GAME_ADDRESS === "0x0000000000000000000000000000000000000000",
    });
  }, []);
  
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { gameState, isLoading: gameStateLoading, refetch } = useGameState();
  const { entryFeeFormatted = "0", entryFee } = useEntryFee();
  const { timerDuration, isLoading: timerDurationLoading } = useTimerDuration();
  const { initialPrizePool, initialPrizePoolFormatted, isLoading: initialPrizePoolLoading } = useInitialPrizePool();

  const { pressButton, isPending: isPressing, isConfirming, isSuccess: pressSuccess, error: pressError, isUsingFreePlay } = usePressButton();
  const { claimPrize, isPending: isClaiming, isConfirming: isClaimConfirming, isSuccess: claimSuccess, error: claimError } = useClaimPrize();
  const { isEligible: isFreePlayEligible, timeUntilFreePlay } = useFreePlayEligibility();
  const { balance, balanceFormatted } = useUserBalance();
  const { winners, isLoading: winnersLoading } = useWinners(10);

  const [timeRemaining, setTimeRemaining] = useState<bigint>(0n);
  const [lastKnownRound, setLastKnownRound] = useState<bigint | null>(null);

  // Event listeners - refetch on events (only after transaction is confirmed)
  useGameEvents(
    () => {
      // Only refetch if not currently confirming a transaction
      if (!isConfirming && !isClaimConfirming) {
        refetch();
        toast.success("Button pressed! Timer reset.");
      }
    },
    () => {
      // Only refetch if not currently confirming a transaction
      if (!isConfirming && !isClaimConfirming) {
        refetch();
        toast.success("Prize claimed! New game started.");
      }
    },
    () => {
      // Only refetch if not currently confirming a transaction
      if (!isConfirming && !isClaimConfirming) {
        refetch();
        toast.success("New game started!");
      }
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

  // Refetch game state after successful press - immediate refetch
  useEffect(() => {
    if (pressSuccess) {
      // Immediate refetch, then refetch again after a short delay to ensure state is updated
      refetch();
      const timeout = setTimeout(() => {
        refetch();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [pressSuccess, refetch]);

  // Show error toast for press errors
  useEffect(() => {
    if (pressError) {
      const errorMsg = pressError.message || String(pressError) || "Transaction failed";
      toast.error(`ERROR: ${errorMsg}`);
    }
  }, [pressError]);

  // Refetch game state after successful claim - immediate refetch
  useEffect(() => {
    if (claimSuccess) {
      // Immediate refetch, then refetch again after a short delay to ensure state is updated
      refetch();
      const timeout = setTimeout(() => {
        refetch();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [claimSuccess, refetch]);

  // Refetch game state after claim error to sync UI
  useEffect(() => {
    if (claimError) {
      const errorMsg = claimError.message || String(claimError) || "";
      toast.error(errorMsg.includes("No prize to claim") 
        ? "The prize has already been claimed. Refreshing game state..."
        : `ERROR: ${errorMsg || "Claim failed"}`);
      // If error is "No prize to claim", refetch to update state
      if (errorMsg.includes("No prize to claim")) {
        setTimeout(() => {
          refetch();
        }, 1000);
      }
    }
  }, [claimError, refetch]);

  // Track round changes to detect when new game starts
  useEffect(() => {
    if (gameState?.currentRound) {
      if (lastKnownRound === null) {
        setLastKnownRound(gameState.currentRound);
      } else if (gameState.currentRound > lastKnownRound) {
        // Round increased, new game started
        setLastKnownRound(gameState.currentRound);
        refetch();
      }
    }
  }, [gameState?.currentRound, gameState?.timeRemaining, gameState?.prizePool, gameState?.lastPlayer, lastKnownRound, refetch]);

  const hasEnoughBalance = balance && entryFee ? balance >= entryFee : false;
  const isWrongChain = chainId !== celoSepolia.id;

  const canPressButton =
    isConnected &&
    !isWrongChain &&
    (gameState?.gameActive ?? false) &&
    (gameState?.timeRemaining ?? 0n) > 0n &&
    !isPressing &&
    !isConfirming &&
    (isFreePlayEligible || hasEnoughBalance);

  // Allow claiming if timer expired - this is needed to start a new game
  const canClaimPrize =
    isConnected &&
    !isWrongChain &&
    (gameState?.gameActive ?? false) &&
    (gameState?.timeRemaining ?? 0n) === 0n &&
    !isClaiming;

  return (
    <main className="min-h-screen bg-celo-tan-light">
      <div className="container mx-auto px-4 py-4 md:py-6 max-w-6xl">
        {/* Round indicator */}
        {gameState && (
          <RoundIndicator currentRound={gameState.currentRound} />
        )}

        {/* Warnings */}
        <ChainWarning isConnected={isConnected} isWrongChain={isWrongChain} />
        <ContractWarning isConnected={isConnected} isWrongChain={isWrongChain} />
        <BalanceWarning
          isConnected={isConnected}
          isWrongChain={isWrongChain}
          hasEnoughBalance={hasEnoughBalance}
          isFreePlayEligible={isFreePlayEligible}
          entryFeeFormatted={entryFeeFormatted}
        />

        {/* Main Game Area */}
        {isConnected && !isWrongChain && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Left Column - Prize Pool */}
            <PrizePool
              prizePool={gameState?.prizePool || 0n}
              progressiveJackpot={gameState?.progressiveJackpot}
              isLoading={gameStateLoading}
            />

            {/* Center Column - Main Button */}
            <GameButton
              canPressButton={canPressButton}
              canClaimPrize={canClaimPrize}
              isPressing={isPressing}
              isConfirming={isConfirming}
              isClaiming={isClaiming}
              isClaimConfirming={isClaimConfirming}
              isUsingFreePlay={isUsingFreePlay}
              isFreePlayEligible={isFreePlayEligible}
              hasEnoughBalance={hasEnoughBalance}
              timeUntilFreePlay={timeUntilFreePlay}
              gameStateLoading={gameStateLoading}
              gameActive={gameState?.gameActive || false}
              timeRemaining={timeRemaining}
              lastPlayer={gameState?.lastPlayer || null}
              address={address}
              onPressButton={pressButton}
              onClaimPrize={() => claimPrize(0n)}
            />

            {/* Right Column - Stats */}
            <StatsPanel
              entryFeeFormatted={entryFeeFormatted}
              isConnected={isConnected}
              balanceFormatted={balanceFormatted}
            >
              <WinnersList winners={winners} isLoading={winnersLoading} />
            </StatsPanel>
          </div>
        )}

        {/* Instructions */}
        {!isConnected && (
          <Instructions entryFeeFormatted={entryFeeFormatted} />
        )}
      </div>
    </main>
  );
}
