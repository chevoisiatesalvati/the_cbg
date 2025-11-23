import { useState, useEffect, useCallback } from "react";
import { useWatchContractEvent, useChainId, usePublicClient } from "wagmi";
import { BUTTON_GAME_ABI, getButtonGameAddress } from "@/lib/contracts";
import { decodeEventLog } from "viem";

export interface RecentPlayer {
  address: `0x${string}`;
  timestamp: number;
  isFreePlay: boolean;
  pressCount: number;
}

const MAX_RECENT_PLAYERS = 10; // Store up to 10, display 3 by default

/**
 * Hook to track recent players who pressed the button
 * Maintains a list of the last N players
 */
export function useRecentPlayers(maxPlayers: number = MAX_RECENT_PLAYERS) {
  const [recentPlayers, setRecentPlayers] = useState<RecentPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentGameStartBlock, setCurrentGameStartBlock] = useState<bigint | null>(null);
  const [lastKnownBlock, setLastKnownBlock] = useState<bigint | null>(null);
  const chainId = useChainId();
  const contractAddress = getButtonGameAddress(chainId);
  const publicClient = usePublicClient();

  // Fetch historical events function (can be called on mount or when needed)
  const fetchHistoricalEvents = useCallback(async () => {
    if (!publicClient || !contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // Get current block number to limit query range
      const currentBlock = await publicClient.getBlockNumber();
      // If we know when the current game started, only fetch events from that block
      // Otherwise, query last 1000 blocks (reasonable limit for performance)
      const fromBlock = currentGameStartBlock 
        ? currentGameStartBlock 
        : (currentBlock > 1000n ? currentBlock - 1000n : 0n);
      
      // Fetch ButtonPressed events using the ABI
      const buttonPressedEvent = BUTTON_GAME_ABI.find(
        (item) => item.type === "event" && item.name === "ButtonPressed"
      );
      
      if (!buttonPressedEvent) {
        setIsLoading(false);
        return;
      }

      const logs = await publicClient.getLogs({
        address: contractAddress,
        event: buttonPressedEvent,
        fromBlock,
        toBlock: "latest",
      });

      // Process logs to build player list with press counts
      // We want the most recent N unique players, ordered by their most recent press
      const playersMap = new Map<string, { player: RecentPlayer; lastBlockNumber: number }>();
      
      // Process all logs to count presses and track most recent block for each player
      for (const log of logs) {
        try {
          const decoded = decodeEventLog({
            abi: BUTTON_GAME_ABI,
            data: log.data,
            topics: log.topics,
          });

          if (decoded.eventName === "ButtonPressed") {
            const player = decoded.args.player as `0x${string}`;
            const isFreePlay = decoded.args.isFreePlay as boolean;
            const playerKey = player.toLowerCase();
            const blockNumber = Number(log.blockNumber);
            
            const existing = playersMap.get(playerKey);
            if (existing) {
              // Increment press count and update to most recent block
              existing.player.pressCount += 1;
              if (blockNumber > existing.lastBlockNumber) {
                existing.lastBlockNumber = blockNumber;
                existing.player.isFreePlay = isFreePlay; // Use most recent free play status
              }
            } else {
              playersMap.set(playerKey, {
                player: {
                  address: player,
                  timestamp: Date.now(), // Will be updated based on position
                  isFreePlay,
                  pressCount: 1,
                },
                lastBlockNumber: blockNumber,
              });
            }
          }
        } catch (error) {
          console.error("Error decoding historical event:", error);
        }
      }

      // Convert to array and sort by most recent block number (newest first)
      const playersWithBlocks = Array.from(playersMap.values());
      playersWithBlocks.sort((a, b) => b.lastBlockNumber - a.lastBlockNumber);
      
      // Take the most recent N players and set timestamps relative to now
      const recentUniquePlayers = playersWithBlocks
        .slice(0, maxPlayers)
        .map((item, index) => ({
          ...item.player,
          timestamp: Date.now() - index * 1000, // Approximate relative timestamps
        }));

      // Update last known block
      setLastKnownBlock(currentBlock);
      
      // Only update if the data actually changed to avoid unnecessary re-renders
      setRecentPlayers((prev) => {
        // Check if the data is actually different
        const prevMap = new Map(prev.map(p => [p.address.toLowerCase(), p]));
        const hasChanged = recentUniquePlayers.length !== prev.length ||
          recentUniquePlayers.some((newPlayer) => {
            const oldPlayer = prevMap.get(newPlayer.address.toLowerCase());
            return !oldPlayer || 
              oldPlayer.pressCount !== newPlayer.pressCount ||
              oldPlayer.isFreePlay !== newPlayer.isFreePlay;
          });
        
        return hasChanged ? recentUniquePlayers : prev;
      });
    } catch (error) {
      console.error("Error fetching historical events:", error);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, contractAddress, maxPlayers, currentGameStartBlock]);

  // Initialize current game start block on mount
  useEffect(() => {
    if (!publicClient || !contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") {
      return;
    }

    const findCurrentGameStart = async () => {
      try {
        const newGameEvent = BUTTON_GAME_ABI.find(
          (item) => item.type === "event" && item.name === "NewGameStarted"
        );
        
        if (!newGameEvent) return;

        const currentBlock = await publicClient.getBlockNumber();
        const fromBlock = currentBlock > 1000n ? currentBlock - 1000n : 0n;
        
        const logs = await publicClient.getLogs({
          address: contractAddress,
          event: newGameEvent,
          fromBlock,
          toBlock: "latest",
        });

        // Get the most recent NewGameStarted event
        if (logs.length > 0) {
          const latestLog = logs[logs.length - 1];
          setCurrentGameStartBlock(latestLog.blockNumber);
        }
      } catch (error) {
        console.error("Error finding current game start:", error);
      }
    };

    findCurrentGameStart();
  }, [publicClient, contractAddress]);

  // Fetch historical events on mount
  useEffect(() => {
    fetchHistoricalEvents();
  }, [fetchHistoricalEvents]);

  // Poll for new events only when new blocks are mined (every 5 seconds, but only refetch if block changed)
  useEffect(() => {
    if (!publicClient || !contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const currentBlock = await publicClient.getBlockNumber();
        // Only refetch if we have a new block
        if (!lastKnownBlock || currentBlock > lastKnownBlock) {
          fetchHistoricalEvents();
        }
      } catch (error) {
        console.error("Error checking for new blocks:", error);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(pollInterval);
  }, [fetchHistoricalEvents, publicClient, contractAddress, lastKnownBlock]);

  // Listen to NewGameStarted events and clear the list
  useWatchContractEvent({
    address: contractAddress,
    abi: BUTTON_GAME_ABI,
    eventName: "NewGameStarted",
    onLogs: async (logs) => {
      if (logs.length > 0 && publicClient) {
        const latestLog = logs[logs.length - 1];
        const newGameBlock = latestLog.blockNumber;
        
        // Clear the recent players list when a new game starts
        setRecentPlayers([]);
        
        // Track the block number when the new game started
        setCurrentGameStartBlock(newGameBlock);
        
        // Reset last known block to trigger a refetch
        setLastKnownBlock(null);
        
        // Refetch to get fresh data for the new game
        setTimeout(() => {
          fetchHistoricalEvents();
        }, 1000);
      }
    },
  });

  // Listen to new ButtonPressed events and update immediately
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
              // Find existing player to increment press count
              const existingPlayer = prev.find((p) => p.address.toLowerCase() === player.toLowerCase());
              const pressCount = existingPlayer ? existingPlayer.pressCount + 1 : 1;
              
              // Remove existing player from list
              const filtered = prev.filter((p) => p.address.toLowerCase() !== player.toLowerCase());
              return [
                { address: player, timestamp, isFreePlay, pressCount },
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
      // Find existing player to increment press count
      const existingPlayer = prev.find((p) => p.address.toLowerCase() === address.toLowerCase());
      const pressCount = existingPlayer ? existingPlayer.pressCount + 1 : 1;
      
      // Remove existing player from list
      const filtered = prev.filter((p) => p.address.toLowerCase() !== address.toLowerCase());
      return [
        { address, timestamp: Date.now(), isFreePlay, pressCount },
        ...filtered,
      ].slice(0, maxPlayers);
    });
  }, [maxPlayers]);

  return {
    recentPlayers,
    addPlayer,
    isLoading,
    refetch: fetchHistoricalEvents,
  };
}

