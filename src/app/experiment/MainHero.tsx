"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { Big_Shoulders_Display } from "next/font/google"
import { useState, useEffect, useRef } from "react"
import { useLenis } from 'lenis/react'
import Lottie from "lottie-react"
import AnimationData from "./fileicon.json" // Ensure this path is correct and the JSON is valid
import { Magnetic } from "@/components/motion-primitives/magnetic"
import SpinningCircle from "./Spinner"

const bigShoulders = Big_Shoulders_Display({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
})

function MainHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Parallax and fade effects based on scroll
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const yOffset = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <motion.div
      ref={containerRef}
      className="text-center flex flex-col items-center z-20 relative"
      style={{ 
        opacity,
        scale,
        y: yOffset,
        willChange: 'transform, opacity'
      }}
    >
     
      <motion.h1
        className={`font-black text-[120px] md:text-[220px] leading-[110px] md:leading-[300px] text-white select-none ${bigShoulders.className}`}
        whileHover={{ 
          scale: 1.02,
          transition: { duration: 0.3, ease: "easeOut" }
        }}
      >
        OFF*
      </motion.h1>

      <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
        <SpinningCircle size={125} />
      </div>

      <motion.h1
        className={`font-black text-[120px] md:text-[220px] leading-[100px] md:leading-[132px] text-[#ea3a59] select-none md:-mt-2 ${bigShoulders.className}`}
        whileHover={{ 
          scale: 1.02,
          transition: { duration: 0.3, ease: "easeOut" }
        }}
      >
        RADAR
      </motion.h1>

      <div className="flex justify-center mt-8">
        
      </div>
    </motion.div>
  )
}

export default MainHero
