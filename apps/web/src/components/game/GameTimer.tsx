"use client";

import { formatTime } from "@/lib/app-utils";

interface GameTimerProps {
  timeRemaining: bigint;
  canClaimPrize: boolean;
  isLoading: boolean;
}

export function GameTimer({ timeRemaining, canClaimPrize, isLoading }: GameTimerProps) {
  return (
    <div
      className={`mb-4 border-2 p-3 w-full ${
        timeRemaining === 0n && canClaimPrize
          ? "bg-celo-orange text-black border-black"
          : "bg-black text-celo-yellow border-celo-yellow"
      }`}
    >
      <div className="font-inter text-xs font-750 uppercase tracking-wider mb-1 text-center">
        {timeRemaining === 0n && canClaimPrize
          ? "⏰ TIMER EXPIRED - CLAIM PRIZE"
          : "TIME REMAINING"}
      </div>
      <div className="font-mono text-2xl md:text-3xl font-bold text-center min-h-[2.5rem] flex items-center justify-center">
        {isLoading ? (
          <span>--:--</span>
        ) : timeRemaining === 0n ? (
          "00:00"
        ) : (
          <span className={Number(timeRemaining) <= 10 ? "animate-pulse-strong text-red-600" : ""}>
            {formatTime(timeRemaining)}
          </span>
        )}
      </div>
    </div>
  );
}

