"use client";

import { formatTime } from "@/lib/app-utils";

interface GameTimerProps {
  timeRemaining: bigint;
  canClaimPrize: boolean;
  isLoading: boolean;
}

export function GameTimer({ timeRemaining, canClaimPrize, isLoading }: GameTimerProps) {
  const isExpired = timeRemaining === 0n;
  
  return (
    <div
      className={`mb-4 border-2 p-3 w-full ${
        isExpired
          ? "bg-cat-yellow text-cat-black border-cat-black"
          : "bg-cat-black text-cat-yellow border-cat-yellow"
      }`}
    >
      <div className="font-inter text-xs font-750 uppercase tracking-wider mb-1 text-center">
        {isExpired
          ? canClaimPrize
            ? "⏰ TIMER EXPIRED - CLAIM PRIZE"
            : "⏰ TIMER EXPIRED"
          : "TIME REMAINING"}
      </div>
      <div className="font-mono text-2xl md:text-3xl font-bold text-center min-h-[2.5rem] flex items-center justify-center">
        {isLoading ? (
          <span>--:--</span>
        ) : isExpired ? (
          <span className="text-red-600">00:00</span>
        ) : (
          <span 
            key={timeRemaining.toString()} 
            className={Number(timeRemaining) <= 10 ? "animate-pulse-strong text-red-600" : ""}
          >
            {formatTime(timeRemaining)}
          </span>
        )}
      </div>
    </div>
  );
}

