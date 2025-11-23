import { useEnsName, useEnsAvatar } from "wagmi";
import { mainnet } from "wagmi/chains";
import { useMemo } from "react";

/**
 * Hook to resolve ENS name from an address
 * @param address - The address to resolve
 * @returns ENS name or null if not found
 */
export function useEnsNameFromAddress(address: `0x${string}` | string | null | undefined) {
  const addressTyped = address && address.startsWith("0x") ? (address as `0x${string}`) : undefined;
  
  const { data: ensName, isLoading, error } = useEnsName({
    address: addressTyped,
    chainId: mainnet.id, // ENS resolution always starts from Ethereum Mainnet
    query: {
      enabled: !!addressTyped && addressTyped !== "0x0000000000000000000000000000000000000000",
      retry: 1,
    },
  });

  return {
    ensName: ensName || null,
    isLoading,
    error,
  };
}

/**
 * Hook to resolve ENS avatar from an address
 * @param address - The address to resolve
 * @returns ENS avatar URL or null if not found
 */
export function useEnsAvatarFromAddress(address: `0x${string}` | string | null | undefined) {
  const addressTyped = address && address.startsWith("0x") ? (address as `0x${string}`) : undefined;
  
  const { data: ensAvatar, isLoading, error } = useEnsAvatar({
    address: addressTyped,
    chainId: mainnet.id, // ENS resolution always starts from Ethereum Mainnet
    query: {
      enabled: !!addressTyped && addressTyped !== "0x0000000000000000000000000000000000000000",
      retry: 1,
    },
  });

  return {
    ensAvatar: ensAvatar || null,
    isLoading,
    error,
  };
}

/**
 * Combined hook to get both ENS name and avatar
 * @param address - The address to resolve
 * @returns Object with ensName, ensAvatar, isLoading, and error
 */
export function useEnsIdentity(address: `0x${string}` | string | null | undefined) {
  const { ensName, isLoading: nameLoading, error: nameError } = useEnsNameFromAddress(address);
  const { ensAvatar, isLoading: avatarLoading, error: avatarError } = useEnsAvatarFromAddress(address);

  return {
    ensName,
    ensAvatar,
    isLoading: nameLoading || avatarLoading,
    error: nameError || avatarError,
  };
}

/**
 * Truncate address for display
 */
export function truncateAddress(address: string, startLength = 6, endLength = 4): string {
  if (!address || address.length <= startLength + endLength) {
    return address;
  }
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

