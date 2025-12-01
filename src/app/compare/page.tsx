"use client"

import { Big_Shoulders_Display } from "next/font/google"
import Particles from "@/components/Particles"
import TargetCursor from "@/components/TargetCursor"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, EyeOff, MonitorOff, Ghost, Activity, MousePointerClick, Shield, CreditCard, Globe, Cpu, CheckCircle, MousePointer2 } from "lucide-react"
import ComparisonTable from "@/components/ComparisonTable"

const bigShoulders = Big_Shoulders_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
})

import Link from "next/link"

export default function ComparePage() {
  const [showTable, setShowTable] = useState(false)




  const handleCompareClick = () => {
    setShowTable(true)
  }

  const handleBackClick = () => {
    setShowTable(false)
  }

  const features = [
    
    {
      feature: { name: "AI Agent", icon:<MousePointer2 className="w-5 h-5" /> },
      comparison: { Ofradr: true, CompetitorA: false, CompetitorB: true },
    },
    {
      feature: { name: "Invisible To Screen Share", icon: <MonitorOff className="w-5 h-5" /> },
      comparison: { Ofradr: true, CompetitorA: false, CompetitorB: true },
    },
    {
      feature: { name: "Invisible To Tray", icon: <Ghost className="w-5 h-5" /> },
      comparison: { Ofradr: true, CompetitorA: true, CompetitorB: false },
    },
    {
      feature: { name: "Invisible To System/Activity Monitor", icon: <Activity className="w-5 h-5" /> },
      comparison: { Ofradr: true, CompetitorA: false, CompetitorB: false },
    },
    {
      feature: { name: "Click-Through Undetectability", icon: <MousePointerClick className="w-5 h-5" /> },
      comparison: { Ofradr: true, CompetitorA: false, CompetitorB: false },
    },
    {
      feature: { name: "Hasn't Been Caught", icon: <Shield className="w-5 h-5" /> },
      comparison: { Ofradr: true, CompetitorA: false, CompetitorB: false },
    },
    {
      feature: { name: "Free", icon: <CreditCard className="w-5 h-5" /> },
      comparison: { Ofradr: true, CompetitorA: false, CompetitorB: false },
    },
    {
      feature: { name: "Undetectable By Browser", icon: <Globe className="w-5 h-5" /> },
      comparison: { Ofradr: true, CompetitorA: true, CompetitorB: true },
    },
    {
      feature: { name: "Undetectable in Task Manager", icon: <Cpu className="w-5 h-5" /> },
      comparison: { Ofradr: true, CompetitorA: false, CompetitorB: false },
    },
    {
      feature: { name: "Works on Any Testing Software", icon: <CheckCircle className="w-5 h-5" /> },
      comparison: { Ofradr: true, CompetitorA: false, CompetitorB: true },
    },
  ]

  const products = [
    { name: "CompetitorA" },
    { name: "Ofradr", color: "gold" as const },
    { name: "CompetitorB" },
  ]

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-black">
      {!showTable && (
        <Link href="/" className="fixed top-8 left-8 z-50 text-white hover:text-[#ea3a59] transition-colors">
          <ArrowLeft size={32} />
        </Link>
      )}
      {/* TargetCursor Component - Only show on initial screen */}
      {!showTable && <TargetCursor targetSelector=".cursor-target" />}

      {/* Particles Background */}
      <div className="absolute inset-0 z-0">
        <Particles
          particleColors={['#ea5d5d', '#bb3030']}
          particleCount={400}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          particleHoverFactor={10}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      <AnimatePresence mode="wait">
        {!showTable ? (
          // Initial "COMPARE PLANS" Screen
          <motion.div
            key="compare-text"
            className="relative z-10 flex items-center justify-center w-full h-screen"
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 3 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <h1
              onClick={handleCompareClick}
              className={`cursor-target cursor-pointer text-7xl md:text-9xl lg:text-[12rem] font-black text-white transition-all hover:scale-105 ${bigShoulders.className}`}
            >
              How we're better
            </h1>
          </motion.div>
        ) : (
          // Comparison Table Screen
          <motion.div
            key="compare-table"
            className="relative z-10 w-full min-h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <div className="absolute top-8 left-8 z-20">
              <motion.button
                onClick={handleBackClick}
                className={`cursor-target flex items-center gap-2 text-white hover:text-[#ea3a59] transition-colors ${bigShoulders.className}`}
                whileHover={{ x: -5 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowLeft className="w-6 h-6" />
                <span className="text-xl">BACK</span>
              </motion.button>
            </div>
            
            <ComparisonTable
              title="Feature Comparison"
              subtitle="See why Ofradr is the best choice"
              features={features}
              products={products}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
