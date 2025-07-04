"use client"

import { motion } from "framer-motion"
import { Big_Shoulders_Display } from "next/font/google"
import AISupportBadge from "./Aibadge"
import Lottie from "lottie-react"
import AnimationData from "./fileicon.json" // Ensure this path is correct and the JSON is valid

const bigShoulders = Big_Shoulders_Display({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
})

function MainHero() {
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
        <AISupportBadge text=" All systems ONLINE" />
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
        <a href="/offradar.zip" download>
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
