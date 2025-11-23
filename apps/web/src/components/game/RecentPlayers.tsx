"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { useRecentPlayers, type RecentPlayer } from "@/hooks/use-recent-players";
import { EnsAddress } from "@/components/ens/EnsAddress";

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

interface RecentPlayersProps {
  initialCount?: number; // Number of players to show initially
  maxCount?: number; // Maximum number of players to show when expanded
}

export function RecentPlayers({ initialCount = 3, maxCount = 10 }: RecentPlayersProps) {
  const { recentPlayers } = useRecentPlayers(maxCount);
  const [isExpanded, setIsExpanded] = useState(false);

  const displayedPlayers = isExpanded 
    ? recentPlayers.slice(0, maxCount)
    : recentPlayers.slice(0, initialCount);

  if (recentPlayers.length === 0) {
    return null;
  }

  return (
    <div className="bg-cat-white border-4 border-cat-black p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="font-inter text-xs font-750 uppercase tracking-wider text-cat-black">
          RECENT PLAYERS
        </div>
        {recentPlayers.length > initialCount && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-inter font-bold uppercase text-cat-darkPink hover:text-cat-black transition-colors"
          >
            {isExpanded ? "SHOW LESS" : `SHOW ALL (${recentPlayers.length})`}
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={isExpanded ? "expanded" : "collapsed"}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2 overflow-hidden"
        >
          {displayedPlayers.map((player, idx) => (
            <motion.div
              key={`${player.address}-${player.timestamp}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center justify-between border-2 border-cat-black p-2"
            >
              <div className="flex items-center gap-2 flex-1">
                <EnsAddress
                  address={player.address}
                  showAvatar={true}
                  avatarSize={24}
                  showAddress={true}
                />
                {player.isFreePlay && (
                  <span className="text-xs font-inter font-bold uppercase text-cat-black bg-cat-yellow border-2 border-cat-black px-2 py-0.5">
                    🎁 FREE
                  </span>
                )}
              </div>
              <div className="text-xs font-inter text-cat-black">
                {formatTimeAgo(player.timestamp)}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

