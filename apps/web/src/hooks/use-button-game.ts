import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { BUTTON_GAME_ABI, BUTTON_GAME_ADDRESS } from "@/lib/contracts";
import { formatUnits } from "viem";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as `0x${string}`;
const isContractDeployed = (address: `0x${string}`) => address !== ZERO_ADDRESS;

export function useGameState() {
  const { data, isLoading, error, refetch } = useReadContract({
    address: BUTTON_GAME_ADDRESS,
    abi: BUTTON_GAME_ABI,
    functionName: "getGameState",
    query: {
      enabled: isContractDeployed(BUTTON_GAME_ADDRESS),
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
        }
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

export function usePressButton() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });
  const { entryFee } = useEntryFee();

  const pressButton = () => {
    if (!entryFee) return;
    writeContract({
      address: BUTTON_GAME_ADDRESS,
      abi: BUTTON_GAME_ABI,
      functionName: "pressButton",
      value: entryFee,
    });
  };

  return {
    pressButton,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useClaimPrize() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claimPrize = () => {
    writeContract({
      address: BUTTON_GAME_ADDRESS,
      abi: BUTTON_GAME_ABI,
      functionName: "claimPrize",
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
