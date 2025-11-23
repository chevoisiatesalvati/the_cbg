"use client";

import { useEnsIdentity, truncateAddress } from "@/hooks/use-ens";

interface EnsAddressProps {
  address: `0x${string}` | string | null | undefined;
  showAvatar?: boolean;
  avatarSize?: number;
  className?: string;
  showAddress?: boolean; // Show address as fallback
  truncateLength?: { start: number; end: number };
}

/**
 * Component to display an address with ENS name and avatar
 * Falls back to truncated address if no ENS name is found
 * Note: Farcaster integration can be added later if needed
 */
export function EnsAddress({
  address,
  showAvatar = true,
  avatarSize = 24,
  className = "",
  showAddress = true,
  truncateLength = { start: 6, end: 4 },
}: EnsAddressProps) {
  const { ensName, ensAvatar, isLoading } = useEnsIdentity(address);

  if (!address || address === "0x0000000000000000000000000000000000000000") {
    return <span className={className}>—</span>;
  }

  const displayName = ensName || (showAddress ? truncateAddress(address, truncateLength.start, truncateLength.end) : null);
  const displayAvatar = ensAvatar;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showAvatar && displayAvatar && (
        <img
          src={displayAvatar}
          alt={displayName || address}
          className="rounded-full border border-black"
          style={{ width: avatarSize, height: avatarSize }}
          onError={(e) => {
            // Hide avatar on error
            e.currentTarget.style.display = "none";
          }}
        />
      )}
      {isLoading ? (
        <span className="text-xs text-gray-400">Loading...</span>
      ) : (
        <span className="font-mono text-xs">{displayName}</span>
      )}
    </div>
  );
}

