"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { type ButtonHTMLAttributes, forwardRef } from "react"

interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string
  shimmerWidth?: string
  shimmerDuration?: string
  background?: string
  className?: string
  children: React.ReactNode
}

const ShimmerButton = forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = "#ffffff",
      shimmerWidth = "100px",
      shimmerDuration = "2s",
      background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "group relative overflow-hidden rounded-lg px-6 py-3 font-medium text-white transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        style={{
          background,
        }}
        {...props}
      >
        {/* Main shimmer effect - moving light ring */}
        <div
          className="absolute inset-0 -translate-x-full animate-shimmer"
          style={{
            background: `linear-gradient(90deg, transparent, ${shimmerColor}60, ${shimmerColor}90, ${shimmerColor}60, transparent)`,
            width: shimmerWidth,
            animationDuration: shimmerDuration,
          }}
        />

        {/* Secondary glow effect */}
        <div
          className="absolute inset-0 -translate-x-full animate-shimmer opacity-50"
          style={{
            background: `linear-gradient(90deg, transparent, ${shimmerColor}30, transparent)`,
            width: `calc(${shimmerWidth} * 1.5)`,
            animationDuration: shimmerDuration,
            animationDelay: "0.1s",
          }}
        />

        {/* Button content */}
        <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>

        <style jsx>{`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(calc(100vw));
            }
          }
          
          .animate-shimmer {
            animation: shimmer ${shimmerDuration} infinite;
          }
        `}</style>
      </button>
    )
  },
)

ShimmerButton.displayName = "ShimmerButton"

export default function sButton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-8">
      <div className="space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Magic UI Shimmer Button</h1>
          <p className="text-gray-400">Watch the light ring sweep across the buttons</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
          <ShimmerButton>Get Started</ShimmerButton>

          <ShimmerButton
            background="linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)"
            shimmerColor="#ffffff"
            shimmerDuration="1.8s"
          >
            Download Now
          </ShimmerButton>

          <ShimmerButton
            background="linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)"
            shimmerColor="#ffffff"
            shimmerDuration="2.2s"
            className="px-8"
          >
            Subscribe
          </ShimmerButton>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
          <ShimmerButton
            background="linear-gradient(135deg, #3742fa 0%, #2f3542 100%)"
            shimmerColor="#00d4ff"
            shimmerWidth="120px"
            className="rounded-full"
          >
            Cyber Button
          </ShimmerButton>

          <ShimmerButton
            background="linear-gradient(135deg, #ffa502 0%, #ff6348 100%)"
            shimmerColor="#ffffff"
            shimmerWidth="80px"
            shimmerDuration="1.5s"
          >
            Fast Shimmer
          </ShimmerButton>

          <ShimmerButton
            background="linear-gradient(135deg, #8e44ad 0%, #3742fa 100%)"
            shimmerColor="#ffffff"
            className="px-10 py-4 text-lg"
          >
            Large Button
          </ShimmerButton>
        </div>

        {/* Special variants */}
        <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
          <ShimmerButton
            background="linear-gradient(135deg, #000000 0%, #1a1a1a 100%)"
            shimmerColor="#gold"
            shimmerWidth="150px"
            className="border border-yellow-500/30"
          >
            ✨ Elite
          </ShimmerButton>

          <ShimmerButton
            background="linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)"
            shimmerColor="#00ff88"
            shimmerDuration="3s"
            className="border border-green-500/30"
          >
            🚀 Launch
          </ShimmerButton>

          <ShimmerButton
            background="linear-gradient(135deg, #2d1b69 0%, #11998e 100%)"
            shimmerColor="#ffffff"
            shimmerWidth="200px"
            shimmerDuration="2.5s"
          >
            💎 Exclusive
          </ShimmerButton>
        </div>
      </div>
    </div>
  )
}
