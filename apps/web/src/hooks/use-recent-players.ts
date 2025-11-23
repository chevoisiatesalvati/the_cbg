import { useState, useEffect, useCallback } from "react";
import { useWatchContractEvent, useChainId } from "wagmi";
import { BUTTON_GAME_ABI, getButtonGameAddress } from "@/lib/contracts";
import { decodeEventLog } from "viem";

export interface RecentPlayer {
  address: `0x${string}`;
  timestamp: number;
  isFreePlay: boolean;
}

const MAX_RECENT_PLAYERS = 10; // Store up to 10, display 3 by default

/**
 * Hook to track recent players who pressed the button
 * Maintains a list of the last N players
 */
export function useRecentPlayers(maxPlayers: number = MAX_RECENT_PLAYERS) {
  const [recentPlayers, setRecentPlayers] = useState<RecentPlayer[]>([]);
  const chainId = useChainId();
  const contractAddress = getButtonGameAddress(chainId);

  // Listen to ButtonPressed events
  useWatchContractEvent({
    address: contractAddress,
    abi: BUTTON_GAME_ABI,
    eventName: "ButtonPressed",
    onLogs: (logs) => {
      logs.forEach((log) => {
        try {
          // Decode the event
          const decoded = decodeEventLog({
            abi: BUTTON_GAME_ABI,
            data: log.data,
            topics: log.topics,
          });

          if (decoded.eventName === "ButtonPressed") {
            const player = decoded.args.player as `0x${string}`;
            const isFreePlay = decoded.args.isFreePlay as boolean;
            const timestamp = Date.now();

            setRecentPlayers((prev) => {
              // Add new player at the beginning, remove duplicates, limit to maxPlayers
              const filtered = prev.filter((p) => p.address.toLowerCase() !== player.toLowerCase());
              return [
                { address: player, timestamp, isFreePlay },
                ...filtered,
              ].slice(0, maxPlayers);
            });
          }
        } catch (error) {
          console.error("Error decoding ButtonPressed event:", error);
        }
      });
    },
  });

  // Also add current player when they press the button (for immediate feedback)
  const addPlayer = useCallback((address: `0x${string}`, isFreePlay: boolean) => {
    setRecentPlayers((prev) => {
      const filtered = prev.filter((p) => p.address.toLowerCase() !== address.toLowerCase());
      return [
        { address, timestamp: Date.now(), isFreePlay },
        ...filtered,
      ].slice(0, maxPlayers);
    });
  }, [maxPlayers]);

  return {
    recentPlayers,
    addPlayer,
  };
}

