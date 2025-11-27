"use client"

import { motion } from "framer-motion"
import { Big_Shoulders_Display } from "next/font/google"
import { useState, useEffect } from "react"
import Lottie from "lottie-react"
import AnimationData from "./fileicon.json" // Ensure this path is correct and the JSON is valid
import { Magnetic } from "@/components/motion-primitives/magnetic"
import SpinningCircle from "./Spinner"

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
      className="text-center flex flex-col items-center z-20 relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
     
      <motion.h1
        className={`font-black text-[120px] md:text-[220px] leading-[110px] md:leading-[300px] text-white select-none ${bigShoulders.className}`}
        variants={itemVariants}
      >
        OFF*
      </motion.h1>

      <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
        <SpinningCircle size={125} />
      </div>

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
        
      </motion.div>
    </motion.div>
  )
}

export default MainHero
