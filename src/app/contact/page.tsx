"use client"

import { Big_Shoulders_Display } from "next/font/google"
import PrismaticBurst from "@/components/PrismaticBurst"
import TargetCursor from "@/components/TargetCursor"

const bigShoulders = Big_Shoulders_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
})

export default function ContactPage() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* TargetCursor Component */}
      <TargetCursor targetSelector=".cursor-target" />

      {/* PrismaticBurst Background */}
      <div className="absolute inset-0 z-0">
        <PrismaticBurst
          intensity={2}
          speed={0.5}
          animationType="rotate3d"
          distort={5}
          mixBlendMode="lighten"
        />
      </div>

      {/* Centered Contact Us Text */}
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <h1 className={`cursor-target text-7xl md:text-9xl lg:text-[12rem] font-black text-white ${bigShoulders.className}`}>
          CONTACT US
        </h1>
      </div>
    </div>
  )
}
