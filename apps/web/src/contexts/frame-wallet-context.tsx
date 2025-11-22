"use client";

import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { celo, celoSepolia } from "wagmi/chains";
import "@rainbow-me/rainbowkit/styles.css";

const config = createConfig({
  chains: [celo, celoSepolia],
  connectors: [farcasterMiniApp()],
  transports: {
    [celo.id]: http(),
    [celoSepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

export default function FrameWalletProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
