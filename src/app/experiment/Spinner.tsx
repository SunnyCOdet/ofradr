"use client"

import { useState } from "react"

interface SpinningCircleProps {
  centerText?: string
  borderText?: string
  backgroundColor?: string
  textColor?: string
  borderColor?: string
  size?: number
  spinDuration?: number
}

export default function SpinningCircle({
  centerText = "Ofradr",
  borderText = "STEALTH • INVISIBLE • PRIVACY •",
  backgroundColor = "rgba(0, 0, 0, 0.2)",
  textColor = "#ffffff",
  borderColor = "rgba(255, 255, 255, 0.2)",
  size = 200,
  spinDuration = 20,
}: SpinningCircleProps) {
  const [isSpinning, setIsSpinning] = useState(true)

  // Create repeated text to ensure full circle coverage
  const repeatedText = borderText.repeat(3)

  return (
    <div className="flex items-center justify-center bg-transparent z-50 p-8">
      <div className="relative">
        {/* Blur background */}
        <div
          className="absolute inset-0 rounded-full backdrop-blur-md border"
          style={{
            backgroundColor,
            borderColor,
            width: size,
            height: size,
          }}
        />

        {/* Main spinning container */}
        <div
          className={`relative rounded-full flex items-center justify-center ${isSpinning ? "animate-spin" : ""}`}
          style={{
            width: size,
            height: size,
            animationDuration: `${spinDuration}s`,
          }}
        >
          {/* Center text */}
          <div
            className="absolute inset-0 flex items-center justify-center font-bold z-10"
            style={{
              color: textColor,
              fontSize: `${size * 0.15}px`,
            }}
          >
            {centerText}
          </div>

          {/* Curved text around the circle */}
          <svg width={size} height={size} className="absolute inset-0" style={{ overflow: "visible" }}>
            <defs>
              <path
                id="circle-path"
                d={`M ${size / 2} ${size / 2} m -${size / 2 - 20} 0 a ${size / 2 - 20} ${size / 2 - 20} 0 1 1 ${2 * (size / 2 - 20)} 0 a ${size / 2 - 20} ${size / 2 - 20} 0 1 1 -${2 * (size / 2 - 20)} 0`}
              />
            </defs>
            <text
              className="text-xs font-semibold tracking-wider"
              style={{
                fill: textColor,
                fontSize: `${size * 0.06}px`,
              }}
            >
              <textPath href="#circle-path" startOffset="0%">
                {repeatedText}
              </textPath>
            </text>
          </svg>
        </div>

        {/* Control buttons */}
        
      </div>
    </div>
  )
}
