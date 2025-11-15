"use client"

import Image from 'next/image'; // ✅ Correct
import Link from "next/link";


import { cn } from "@/lib/utils"
import { type ButtonHTMLAttributes, forwardRef, useEffect, useState } from "react"

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

interface GlassNavbarProps {
  transparency?: number // 0-100
  tintColor?: string // hex color or rgba color
  blurIntensity?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl"
}

export default function GlassNavbar({
  transparency = 10,
  tintColor = "#000000",
  blurIntensity = "md",
}: GlassNavbarProps) {
  const blurClasses = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl",
    "2xl": "backdrop-blur-2xl",
    "3xl": "backdrop-blur-3xl",
  }

  // Function to detect if color is hex or rgba
  const isRgbaColor = (color: string): boolean => {
    return color.toLowerCase().startsWith("rgba(") || color.toLowerCase().startsWith("rgb(")
  }

  // Function to convert hex to rgba with transparency
  const hexToRgba = (hex: string, transparency: number): string => {
    const r = Number.parseInt(hex.slice(1, 3), 16)
    const g = Number.parseInt(hex.slice(3, 5), 16)
    const b = Number.parseInt(hex.slice(5, 7), 16)
    const alpha = transparency / 100
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  // Function to modify rgba transparency
  const modifyRgbaTransparency = (rgba: string, transparency: number): string => {
    // Parse rgba string
    const rgbaMatch = rgba.match(/rgba?$$(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?$$/)
    if (!rgbaMatch) return rgba

    const r = rgbaMatch[1]
    const g = rgbaMatch[2]
    const b = rgbaMatch[3]
    const alpha = transparency / 100

    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  // Function to get background color based on input type
  const getBackgroundColor = (): string => {
    if (isRgbaColor(tintColor)) {
      return modifyRgbaTransparency(tintColor, transparency)
    } else {
      // Handle hex colors (existing logic)
      if (tintColor.startsWith("#")) {
        return hexToRgba(tintColor, transparency)
      } else {
        // Fallback for hex without #
        return hexToRgba(`#${tintColor}`, transparency)
      }
    }
  }

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

  return (
    <nav
      className={`fixed top-0 left-0  right-0 z-50 ${blurClasses[blurIntensity]} border-b border-white/20`}
      style={{
        backgroundColor: getBackgroundColor(),
      }}
    >
      <div className="relative  mx-24 ">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center flex-row gap-10 ">
            <Link href="/" className="cursor-pointer">
              <Image src="/logo.png" alt="Logo" width={70} height={70} />
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-white/50 text-sm hover:text-white transition-colors tracking-tight duration-200">
                Home
              </Link>
              <Link href="/about" className="text-white/50 text-sm hover:text-white transition-colors duration-200">
                About
              </Link>
              <Link href="/contact" className="text-white/50 text-sm hover:text-white transition-colors duration-200">
                Contact
              </Link>
              <Link href="/about" className="text-white/50 text-sm hover:text-white transition-colors duration-200">
                Usage
              </Link>
              <a 
                href="#pricing" 
                onClick={(e) => {
                  e.preventDefault()
                  const element = document.getElementById('pricing')
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                }}
                className="text-white/50 text-sm hover:text-white transition-colors duration-200 cursor-pointer"
              >
                Pricing
              </a>
              <Link href="/ofradr-max" className="text-white/50 text-sm hover:text-white transition-colors duration-200">
                ofradr max
              </Link>
            </div>
          </div>
          {/* Right Side Actions */}
          <div className="absolute right-0 flex items-center space-x-4">
            {user ? (
              <span className="text-white/80 font-semibold px-4">Hello, {user.username}</span>
            ) : (
              <Link href="/getin" className="no-underline">
                <AuthShimmerButton type="button" className="mt-2 bg-gradient-to-r ">
                  Create Account
                </AuthShimmerButton>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
