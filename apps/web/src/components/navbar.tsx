"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ExternalLink } from "lucide-react"
import { Wallet, Connect, Avatar, Name } from "@composer-kit/ui/wallet"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useChainId } from "wagmi"

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Docs", href: "https://docs.celo.org", external: true },
]

export function Navbar() {
  const pathname = usePathname()
  const chainId = useChainId()
  
  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-black bg-background backdrop-blur-md supports-[backdrop-filter]:bg-background/95">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {/* Title */}
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <h1 className="font-alpina text-2xl md:text-3xl font-light tracking-tighter text-celo-purple">
              THE <span className="italic border-b-2 border-celo-yellow">CBG</span>
            </h1>
          </Link>
        </div>
        
        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href
                  ? "text-foreground"
                  : "text-foreground/70"
              }`}
            >
              {link.name}
              {link.external && <ExternalLink className="h-4 w-4" />}
            </Link>
          ))}
        </nav>
        
        {/* Connect button and chain selector */}
        <div className="flex items-center gap-3">
          <ConnectButton.Custom>
            {({ account, chain, openChainModal, mounted }) => {
              const ready = mounted
              const connected = ready && account && chain

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    style: {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {connected && (
                    <button
                      onClick={openChainModal}
                      type="button"
                      className="px-3 py-1.5 text-sm font-medium border-2 border-black bg-white text-black rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-celo-yellow flex items-center gap-2"
                    >
                      {chain.hasIcon && (
                        <div
                          style={{
                            background: chain.iconBackground,
                            width: 16,
                            height: 16,
                            borderRadius: 999,
                            overflow: 'hidden',
                          }}
                        >
                          {chain.iconUrl && (
                            <img
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              style={{ width: 16, height: 16 }}
                            />
                          )}
                        </div>
                      )}
                      <span>{chain.name}</span>
                    </button>
                  )}
                </div>
              )
            }}
          </ConnectButton.Custom>
          <Wallet>
            <Connect label="Connect">
              <Avatar />
              <Name />
            </Connect>
          </Wallet>
        </div>
      </div>
    </header>
  )
}
