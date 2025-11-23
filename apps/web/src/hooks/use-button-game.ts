import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent, useBalance, useEstimateGas } from "wagmi";
import { BUTTON_GAME_ABI, BUTTON_GAME_ADDRESS } from "@/lib/contracts";
import { useAccount } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { useEffect, useCallback } from "react";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as `0x${string}`;
const isContractDeployed = (address: `0x${string}`) => address !== ZERO_ADDRESS;

export interface WinnerInfo {
  winner: `0x${string}`;
  prize: bigint;
  timestamp: bigint;
  round: bigint;
}

export interface GameState {
  timerEnd: bigint;
  prizePool: bigint;
  lastPlayer: `0x${string}`;
  gameActive: boolean;
  timeRemaining: bigint;
  currentRound: bigint;
  progressiveJackpot: bigint;
}

export function useGameState() {
  const { data, isLoading, error, refetch } = useReadContract({
    address: BUTTON_GAME_ADDRESS,
    abi: BUTTON_GAME_ABI,
    functionName: "getGameState",
    query: {
      enabled: isContractDeployed(BUTTON_GAME_ADDRESS),
      refetchInterval: 1000,
    },
  });

  return {
    gameState: data
      ? {
          timerEnd: data[0],
          prizePool: data[1],
          lastPlayer: data[2],
          gameActive: data[3],
          timeRemaining: data[4],
          currentRound: data[5],
          progressiveJackpot: data[6],
        } as GameState
      : null,
    isLoading,
    error,
    refetch,
  };
}

export function useEntryFee() {
  const { data, isLoading } = useReadContract({
    address: BUTTON_GAME_ADDRESS,
    abi: BUTTON_GAME_ABI,
    functionName: "entryFee",
    query: {
      enabled: isContractDeployed(BUTTON_GAME_ADDRESS),
    },
  });

  return {
    entryFee: data,
    entryFeeFormatted: data ? formatUnits(data, 18) : "0",
    isLoading,
  };
}

export function useTimerDuration() {
  const { data, isLoading } = useReadContract({
    address: BUTTON_GAME_ADDRESS,
    abi: BUTTON_GAME_ABI,
    functionName: "timerDuration",
    query: {
      enabled: isContractDeployed(BUTTON_GAME_ADDRESS),
    },
  });

  return {
    timerDuration: data,
    isLoading,
  };
}

export function useInitialPrizePool() {
  const { data, isLoading } = useReadContract({
    address: BUTTON_GAME_ADDRESS,
    abi: BUTTON_GAME_ABI,
    functionName: "initialPrizePool",
    query: {
      enabled: isContractDeployed(BUTTON_GAME_ADDRESS),
    },
  });

  return {
    initialPrizePool: data,
    initialPrizePoolFormatted: data ? formatUnits(data, 18) : "0",
    isLoading,
  };
}

export function useFreePlayEligibility() {
  const { address } = useAccount();
  const { data: lastFreePlay, isLoading } = useReadContract({
    address: BUTTON_GAME_ADDRESS,
    abi: BUTTON_GAME_ABI,
    functionName: "lastFreePlay",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isContractDeployed(BUTTON_GAME_ADDRESS),
    },
  });

  const { data: isEligible } = useReadContract({
    address: BUTTON_GAME_ADDRESS,
    abi: BUTTON_GAME_ABI,
    functionName: "isEligibleForFreePlay",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isContractDeployed(BUTTON_GAME_ADDRESS),
    },
  });

  const getTimeUntilFreePlay = useCallback(() => {
    if (!lastFreePlay || !isEligible) return null;
    const cooldown = 24 * 60 * 60; // 24 hours in seconds
    const nextFreePlay = Number(lastFreePlay) + cooldown;
    const now = Math.floor(Date.now() / 1000);
    const remaining = nextFreePlay - now;
    return remaining > 0 ? remaining : 0;
  }, [lastFreePlay, isEligible]);

  return {
    isEligible: isEligible ?? false,
    lastFreePlay,
    timeUntilFreePlay: getTimeUntilFreePlay(),
    isLoading,
  };
}

export function useUserBalance() {
  const { address } = useAccount();
  const { data, isLoading } = useBalance({
    address,
    query: {
      enabled: !!address,
    },
  });

  return {
    balance: data?.value,
    balanceFormatted: data ? formatUnits(data.value, 18) : "0",
    isLoading,
  };
}

export function usePressButton() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });
  const { entryFee } = useEntryFee();
  const { isEligible } = useFreePlayEligibility();

  const pressButton = () => {
    // Automatically use free play if eligible, otherwise use entry fee
    const useFreePlay = isEligible ?? false;
    
    if (!entryFee && !useFreePlay) return;
    
    writeContract({
      address: BUTTON_GAME_ADDRESS,
      abi: BUTTON_GAME_ABI,
      functionName: "pressButton",
      args: [useFreePlay],
      value: useFreePlay ? 0n : (entryFee ?? 0n),
    });
  };

  // Estimate gas for press button
  const { data: gasEstimate, isLoading: isEstimatingGas } = useEstimateGas({
    to: BUTTON_GAME_ADDRESS,
    data: entryFee ? undefined : undefined, // Will be set dynamically
  });

  return {
    pressButton,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    gasEstimate,
    isEstimatingGas,
    isUsingFreePlay: isEligible ?? false,
  };
}

export function useClaimPrize() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claimPrize = (sponsorshipAmount: bigint = 0n) => {
    writeContract({
      address: BUTTON_GAME_ADDRESS,
      abi: BUTTON_GAME_ABI,
      functionName: "claimPrizeAndStartNewGame",
      args: [sponsorshipAmount],
      value: sponsorshipAmount,
    });
  };

  return {
    claimPrize,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useWinners(count: number = 10) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: BUTTON_GAME_ADDRESS,
    abi: BUTTON_GAME_ABI,
    functionName: "getLatestWinners",
    args: [BigInt(count)],
    query: {
      enabled: isContractDeployed(BUTTON_GAME_ADDRESS),
    },
  });

  return {
    winners: data as WinnerInfo[] | undefined,
    isLoading,
    error,
    refetch,
  };
}

// Event listeners
export function useGameEvents(onButtonPressed?: () => void, onPrizeWon?: () => void, onNewGame?: () => void) {
  useWatchContractEvent({
    address: BUTTON_GAME_ADDRESS,
    abi: BUTTON_GAME_ABI,
    eventName: "ButtonPressed",
    onLogs: () => {
      onButtonPressed?.();
    },
  });

  useWatchContractEvent({
    address: BUTTON_GAME_ADDRESS,
    abi: BUTTON_GAME_ABI,
    eventName: "PrizeWon",
    onLogs: () => {
      onPrizeWon?.();
    },
  });

  useWatchContractEvent({
    address: BUTTON_GAME_ADDRESS,
    abi: BUTTON_GAME_ABI,
    eventName: "NewGameStarted",
    onLogs: () => {
      onNewGame?.();
    },
  });
}
