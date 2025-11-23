"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import { useRecentPlayers, type RecentPlayer } from "@/hooks/use-recent-players";
import { EnsAddress } from "@/components/ens/EnsAddress";
import Image from "next/image";
import { useAccount } from "wagmi";

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface LastPlaysProps {
  lastPlayer: string | null;
  address: string | undefined;
}

export function LastPlays({ lastPlayer, address }: LastPlaysProps) {
  const { recentPlayers } = useRecentPlayers(10);
  const { address: currentAddress } = useAccount();

  // Combine recent players with lastPlayer from game state
  // The lastPlayer is the current winner and should be at the top
  const allPlayers = useMemo(() => {
    const players = [...recentPlayers];
    
    // If lastPlayer exists and is not already in recentPlayers, add it
    if (lastPlayer && lastPlayer !== "0x0000000000000000000000000000000000000000") {
      const existingIndex = players.findIndex(
        (p) => p.address.toLowerCase() === lastPlayer.toLowerCase()
      );
      
      if (existingIndex === -1) {
        // Add lastPlayer at the beginning as the current winner
        players.unshift({
          address: lastPlayer as `0x${string}`,
          timestamp: Date.now(),
          isFreePlay: false,
          pressCount: 1,
        });
      } else if (existingIndex > 0) {
        // Move existing player to the top if it's not already there
        const [movedPlayer] = players.splice(existingIndex, 1);
        players.unshift(movedPlayer);
      }
    }
    
    // Limit to 10 players max
    return players.slice(0, 10);
  }, [recentPlayers, lastPlayer]);

  if (allPlayers.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-cat-white border-4 border-cat-black p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="font-inter text-xs font-750 uppercase tracking-wider text-cat-black">
            LAST PLAYS
          </div>
          {allPlayers.length > 3 && (
            <div className="text-xs font-inter font-bold uppercase text-cat-darkPink">
              {allPlayers.length} PLAYS
            </div>
          )}
        </div>

        <div 
          className="space-y-2 min-h-[165px] max-h-[300px] overflow-y-auto pr-1"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#231F20 #F892B0',
          }}
        >
          <AnimatePresence mode="popLayout">
            {allPlayers.map((player, idx) => {
              // The winner is always the first player (most recent) if lastPlayer matches
              const isWinner = idx === 0 && 
                lastPlayer && 
                lastPlayer !== "0x0000000000000000000000000000000000000000" &&
                player.address.toLowerCase() === lastPlayer.toLowerCase();
              const isCurrentUser = currentAddress && 
                player.address.toLowerCase() === currentAddress.toLowerCase();

              return (
                <motion.div
                  key={`${player.address}-${player.timestamp}`}
                  initial={{ 
                    opacity: 0, 
                    x: -30,
                    scale: 0.9,
                    y: -10
                  }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    scale: 1,
                    y: 0
                  }}
                  exit={{ 
                    opacity: 0, 
                    x: 20,
                    scale: 0.95
                  }}
                  transition={{ 
                    delay: idx === 0 ? 0 : idx * 0.05,
                    type: "spring",
                    stiffness: 400,
                    damping: 20
                  }}
                  layout
                  className={`
                    flex items-center justify-between 
                    border-2 border-cat-black p-2
                    ${isWinner ? 'bg-cat-yellow shadow-[3px_3px_0_0_rgba(35,31,32,1)]' : 'bg-cat-white'}
                    transition-colors
                  `}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <EnsAddress
                      address={player.address}
                      showAvatar={true}
                      avatarSize={28}
                      showAddress={true}
                      className="flex-shrink-0"
                    />
                    {isCurrentUser && (
                      <span className="text-xs font-inter font-bold text-cat-darkPink whitespace-nowrap">
                        (YOU)
                      </span>
                    )}
                    {player.isFreePlay && (
                      <span className="text-xs font-inter font-bold uppercase text-cat-black bg-cat-pink border-2 border-cat-black px-2 py-0.5 whitespace-nowrap">
                        🎁 FREE
                      </span>
                    )}
                    {player.pressCount > 1 && (
                      <span className="text-xs font-inter font-bold text-cat-black bg-cat-yellow border-2 border-cat-black px-2 py-0.5 whitespace-nowrap">
                        {player.pressCount}x
                      </span>
                    )}
                    {isWinner && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0, rotate: -180 }}
                        animate={{ 
                          opacity: 1, 
                          scale: 1,
                          rotate: 0
                        }}
                        transition={{ 
                          delay: 0.2,
                          type: "spring",
                          stiffness: 400,
                          damping: 15
                        }}
                        className="flex-shrink-0"
                      >
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          <Image
                            src="/cat-serious.webp"
                            alt="Winner"
                            width={24}
                            height={24}
                            className="object-contain"
                          />
                        </motion.div>
                      </motion.div>
                    )}
                  </div>
                  <div className="text-xs font-inter text-cat-black flex-shrink-0">
                    {formatTimeAgo(player.timestamp)}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

