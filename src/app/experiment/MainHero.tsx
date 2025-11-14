"use client"

import { motion } from "framer-motion"
import { Big_Shoulders_Display } from "next/font/google"
import { useState, useEffect } from "react"
import Lottie from "lottie-react"
import AnimationData from "./fileicon.json" // Ensure this path is correct and the JSON is valid

const bigShoulders = Big_Shoulders_Display({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
})

function MainHero() {
  const [showStrike, setShowStrike] = useState(false)
  const [typingText, setTypingText] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const fullText = "OFRADR MAX"
  const baseText = "OFRADR"

  useEffect(() => {
    // First show "ofradr" with strike-through
    const strikeTimer = setTimeout(() => {
      setShowStrike(true)
    }, 500)

    // Then start typing "ofradr max" after a delay
    const typingTimer = setTimeout(() => {
      let i = 0
      const typingInterval = setInterval(() => {
        if (i < fullText.length) {
          setTypingText(fullText.substring(0, i + 1))
          i++
        } else {
          clearInterval(typingInterval)
        }
      }, 100) // Typing speed

      return () => clearInterval(typingInterval)
    }, 1500)

    // Blink cursor continuously
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 530)

    return () => {
      clearTimeout(strikeTimer)
      clearTimeout(typingTimer)
      clearInterval(cursorInterval)
    }
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
        duration: 0.8,
      },
    },
  }

  return (
    <motion.div
      className="text-center flex flex-col items-center z-20 relative top-[110px] left-1/2 -translate-x-1/2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="mt-5">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border"
          style={{
            backgroundColor: "rgba(127, 29, 29, 0.9)",
            borderColor: "rgba(185, 28, 28, 0.6)",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        >
          {/* Blinking Pink Orb with Glow */}
          <div
            className="relative w-2 h-2 rounded-full"
            style={{
              backgroundColor: "#ea3a59",
              boxShadow: `
                0 0 4px #ea3a59,
                0 0 8px #ea3a59,
                0 0 12px #ea3a59,
                0 0 16px #ea3a59
              `,
              animation: "smoothBlink 2s ease-in-out infinite",
            }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                backgroundColor: "#ea3a59",
                filter: "blur(1px)",
                animation: "glowPulse 2s ease-in-out infinite",
              }}
            />
          </div>

          {/* Text with typing animation */}
          <span className="text-white text-sm font-medium whitespace-nowrap">
            Introducing{" "}
            <span className="inline-block">
              {showStrike && (
                <span className="line-through text-white/60 mr-2">{baseText}</span>
              )}
              {typingText && (
                <span className="text-[#ea3a59]">
                  {typingText}
                  {showCursor && <span className="animate-pulse">|</span>}
                </span>
              )}
            </span>
          </span>

          <style jsx>{`
            @keyframes smoothBlink {
              0%, 100% {
                opacity: 1;
                transform: scale(1);
              }
              50% {
                opacity: 0.4;
                transform: scale(0.9);
              }
            }
            
            @keyframes glowPulse {
              0%, 100% {
                opacity: 0.8;
                transform: scale(1.2);
              }
              50% {
                opacity: 0.3;
                transform: scale(1.5);
              }
            }
          `}</style>
        </div>
      </div>

      <motion.h1
        className={`font-black text-[120px] md:text-[220px] leading-[110px] md:leading-[300px] text-white select-none ${bigShoulders.className}`}
        variants={itemVariants}
      >
        OFF*
      </motion.h1>

      <motion.h1
        className={`font-black text-[120px] md:text-[220px] leading-[100px] md:leading-[132px] text-[#ea3a59] select-none md:-mt-2 ${bigShoulders.className}`}
        variants={itemVariants}
      >
        RADAR
      </motion.h1>

      <motion.div
        className="flex justify-center mt-8"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 12,
          delay: 0.8,
          duration: 0.8,
        }}
      >
        <a href="/ofradr.zip" download>
          <button className="bg-[#ea3a59] flex items-center mt-9 justify-center gap-2 w-40 h-14 rounded-full text-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(234,58,89,0.6)] hover:shadow-[0_0_30px_rgba(234,58,89,0.8)]">
            {/* <div className="w-8 h-8">
              <Lottie
                animationData={AnimationData}
                loop
                autoplay
                style={{ width: "100%", height: "100%" }}
              />
            </div> */}
            <span>Download</span>
          </button>
        </a>
      </motion.div>
    </motion.div>
  )
}

export default MainHero
