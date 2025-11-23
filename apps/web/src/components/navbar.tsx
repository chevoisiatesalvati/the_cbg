"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ExternalLink } from "lucide-react"
import { Wallet, Connect, Avatar, Name } from "@composer-kit/ui/wallet"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useChainId } from "wagmi"
import Image from "next/image"

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Docs", href: "https://docs.celo.org", external: true },
]

export function Navbar() {
  const pathname = usePathname()
  const chainId = useChainId()
  
  return (
    <header className="sticky top-0 z-50 w-full border-b-4 border-cat-black bg-cat-white backdrop-blur-md supports-[backdrop-filter]:bg-cat-white/95">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {/* Cat Logo */}
          <Link href="/" className="hover:opacity-80 transition-opacity flex items-center gap-2">
            <Image
              src="/cat-serious.webp"
              alt="Pink Cat"
              width={40}
              height={40}
              className="object-contain"
            />
            {/* Title */}
            <h1 className="font-alpina text-2xl md:text-3xl font-light tracking-tighter text-cat-black">
              THE <span className="italic border-b-2 border-cat-yellow">CBG</span>
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
              className={`flex items-center gap-1.5 text-sm font-bold uppercase transition-colors ${
                pathname === link.href
                  ? "text-cat-black"
                  : "text-cat-black/70 hover:text-cat-darkPink"
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
                      className="px-3 py-1.5 text-sm font-bold uppercase border-2 border-cat-black bg-cat-white text-cat-black hover:bg-cat-yellow focus:outline-none focus:ring-2 focus:ring-cat-yellow flex items-center gap-2 transition-colors"
                      title={chain.name}
                    >
                      {chain.hasIcon && chain.iconUrl ? (
                        <div
                          style={{
                            background: chain.iconBackground,
                            width: 16,
                            height: 16,
                            borderRadius: 999,
                            overflow: 'hidden',
                          }}
                        >
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 16, height: 16 }}
                          />
                        </div>
                      ) : (
                        <span className="md:hidden text-xs">
                          {chain.name ? chain.name.substring(0, 8) : 'CHAIN'}
                        </span>
                      )}
                      <span className="hidden md:inline max-w-[120px] truncate">{chain.name}</span>
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
