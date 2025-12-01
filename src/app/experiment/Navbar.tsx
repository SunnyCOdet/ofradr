"use client"

import React, { useState, useEffect, forwardRef, ButtonHTMLAttributes } from 'react'
import Link from "next/link"
import { cn } from "@/lib/utils"
import CardNav from "../../components/CardNav"

interface AuthShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
}

const AuthShimmerButton = forwardRef<HTMLButtonElement, AuthShimmerButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "group relative w-full rounded-full overflow-hidden rounded-lg bg-gradient-to-r px-6 py-3 font-medium text-white transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-xl disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {/* Shimmer light ring effect */}
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 h-80 w-80 to-transparent" />

        {/* Button content */}
        <span className="relative z-10">{children}</span>

        <style jsx>{`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(200%);
            }
          }
          
          .animate-shimmer {
            animation: shimmer 2s infinite;
          }
        `}</style>
      </button>
    )
  },
)

AuthShimmerButton.displayName = "AuthShimmerButton"

export default function Navbar() {
  // User state for showing username
  const [user, setUser] = useState<{ username: string } | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user")
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr)
          setUser(parsed)
        } catch {}
      }
    }
  }, [])

  const navItems = [
    {
      label: 'General',
      bgColor: '#000000ff',
      textColor: '#fff',
      links: [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' }
      ]
    },
    {
      label: 'Product',
      bgColor: '#000000ff',
      textColor: '#fff',
      links: [
        { label: 'Usage', href: '/usage' }, // Updated to /usage
        { label: 'Demonstration', href: '/demo' },
        { label: 'Comparison', href: '/compare' },

      ]
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem("user")
    setUser(null)
    window.location.href = "/" // Force reload/redirect to clear any other state if needed
  }

  const CustomAuthButton = (
    <div className="flex items-center gap-4">
      {user ? (
        <>
          <span className="text-white font-semibold">Hello, {user.username}</span>
          <button 
            onClick={handleLogout}
            className="text-xs text-white/60 hover:text-white transition-colors border border-white/10 hover:border-white/30 rounded-full px-3 py-1.5 hover:bg-white/5"
          >
            Logout
          </button>
        </>
      ) : (
        <Link href="/getin" className="no-underline">
          <AuthShimmerButton type="button" className="bg-transparent text-white">
            Create Account
          </AuthShimmerButton>
        </Link>
      )}
    </div>
  );

  return (
   <CardNav
      logo="/logo.png"
      logoAlt="Ofradr Logo"
      items={navItems}
      baseColor="transparent"
      menuColor="#ffffff"
      buttonBgColor="#ffffff"
      buttonTextColor="#000000"
      customCTA={CustomAuthButton}
      className="fixed top-0 left-0 right-0 z-50"
    />
  )
}
