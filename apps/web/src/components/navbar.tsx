"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ExternalLink } from "lucide-react"
import { Wallet, Connect, Avatar, Name } from "@composer-kit/ui/wallet"

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Docs", href: "https://docs.celo.org", external: true },
]

export function Navbar() {
  const pathname = usePathname()
  
  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-black bg-celo-tan-light backdrop-blur-md supports-[backdrop-filter]:bg-celo-tan-light/60">
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
        
        {/* Connect button */}
        <div className="flex items-center gap-3">
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
