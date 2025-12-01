"use client"

import React, { useState, useEffect } from "react"
import ComparisonTable from "../../components/ComparisonTable"
import { Zap, Shield, Globe, Cpu, Smartphone, EyeOff, MonitorOff, Ghost, Activity, MousePointerClick, CreditCard, CheckCircle } from "lucide-react"
import { SpiralAnimation } from "../../components/ui/spiral-animation"
import { motion, AnimatePresence } from "framer-motion"
import { Big_Shoulders_Display } from "next/font/google"

const bigShoulders = Big_Shoulders_Display({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
})

export default function ComparisonPage() {
  const [showTable, setShowTable] = useState(false)

  // Removed setTimeout logic
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setShowTable(true)
  //   }, 4000) 

  //   return () => clearTimeout(timer)
  // }, [])

  const features = [
    {
      feature: { name: "Invisible In Dock", icon: <EyeOff className="w-5 h-5" /> },
      comparison: { Ofradr: true, CompetitorA: false, CompetitorB: false },
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
    { name: "Ofradr", color: "gold" as const },
    { name: "CompetitorA", color: "default" as const },
    { name: "CompetitorB", color: "default" as const },
  ]

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden">
      <AnimatePresence mode="wait">
        {!showTable ? (
          <motion.div
            key="intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <SpiralAnimation onComplete={() => setShowTable(true)} />
            <h1 className={`absolute z-10 text-white text-2xl font-black uppercase tracking-widest translate-y-4 ${bigShoulders.className}`}>
              Comparison
            </h1>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="relative z-10 min-h-screen"
          >
            <ComparisonTable
              title="Compare Plans"
              subtitle="See why Ofradr is the best choice for you."
              features={features}
              products={products}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
