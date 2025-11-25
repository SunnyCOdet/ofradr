"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FlipWords } from "@/component/Loadliner"
import { Big_Shoulders_Display } from "next/font/google"
import dynamic from "next/dynamic"

// Dynamically import Lottie to prevent SSR issues
const Lottie = dynamic(() => import("lottie-react"), { ssr: false })

const bigShoulders = Big_Shoulders_Display({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
})

export const Hero = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Don't render until mounted to prevent hydration mismatch
  if (!isMounted) {
    return null
  }

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
    hidden: {
      y: 100,
      opacity: 0,
    },
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
    <section className="relative flex flex-col bg-transparent items-center justify-center">
      <div className="min-h-screen bg-transparent flex items-center justify-center p-8">
        <motion.div className="text-center" variants={containerVariants} initial="hidden" animate="visible">
          <motion.div className="text-center md:text-2xl text-xl mt-10 text-yellow-200" variants={itemVariants}>
            &#9679; <span className="text-white">My model is </span>
            <FlipWords words={["Undetectable", "Smarter", "F*cking fast"]} />
          </motion.div>

          <motion.h1
            className={`font-black text-[120px] md:text-[220px] leading-[110px] md:leading-[262px] text-[#e0f11f] select-none ${bigShoulders.className}`}
            variants={itemVariants}
          >
            OFF*
          </motion.h1>

          <motion.h1
            className={`font-black text-[120px] md:text-[220px] leading-[100px] md:leading-[132px] text-[#e0f11f] select-none md:-mt-2 ${bigShoulders.className}`}
            variants={itemVariants}
          >
            RADAR
          </motion.h1>
        </motion.div>

        <motion.a
          href="/ofradr.zip"
          className="absolute mt-[420px] md:mt-[680px]"
          download
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
          <button className="bg-[rgba(224,241,31,255)] flex items-center justify-center gap-2 w-40 h-14 rounded-full text-xl hover:scale-105 transition-transform">
            <div className="w-8 h-8">
              {isMounted && <Lottie animationData={require("@/assets/fileicon.json")} loop={true} autoplay={true} />}
            </div>
            <span>Download</span>
          </button>
        </motion.a>
      </div>
    </section>
  )
}
