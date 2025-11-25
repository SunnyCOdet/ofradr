"use client"

import type React from "react"

import { ChevronDown } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { motion } from "framer-motion"
import { Big_Shoulders_Display } from "next/font/google"

const bigShoulders = Big_Shoulders_Display({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
})
interface PlatformItem {
  id: string
  number: string
  name: string
  icon: string
  status: "Undetectable" | "Conditional"
}

const platforms: PlatformItem[] = [
  {
    id: "1",
    number: "001",
    name: "Hackerrank",
    icon: "/placeholder.svg?height=24&width=24",
    status: "Undetectable",
  },
  {
    id: "2",
    number: "002",
    name: "Codesignal",
    icon: "/placeholder.svg?height=24&width=24",
    status: "Undetectable",
  },
  {
    id: "3",
    number: "003",
    name: "Unstop",
    icon: "/placeholder.svg?height=24&width=24",
    status: "Undetectable",
  },
  {
    id: "4",
    number: "004",
    name: "Chime",
    icon: "/placeholder.svg?height=24&width=24",
    status: "Undetectable",
  },
  {
    id: "5",
    number: "005",
    name: "Microsoft Teams",
    icon: "/placeholder.svg?height=24&width=24",
    status: "Undetectable",
  },
  {
    id: "6",
    number: "006",
    name: "Google Meet",
    icon: "/placeholder.svg?height=24&width=24",
    status: "Undetectable",
  },
  {
    id: "6",
    number: "007",
    name: "PearsonVUE",
    icon: "/placeholder.svg?height=24&width=24",
    status: "Conditional",
  },
  {
    id: "7",
    number: "008",
    name: "Myanatomy",
    icon: "/placeholder.svg?height=24&width=24",
    status: "Undetectable",
  },
  {
    id: "8",
    number: "009",
    name: "Mattel",
    icon: "/placeholder.svg?height=24&width=24",
    status: "Undetectable",
  },
]

// Terminal Components (simplified versions)
const Terminal = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-transparent/90 border border-gray-700 rounded-lg p-4 font-mono text-sm max-w-md">{children}</div>
)

const TypingAnimation = ({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: delay / 1000, duration: 0.5 }}
    className={`text-green-400 ${className}`}
  >
    {children}
  </motion.div>
)

const AnimatedSpan = ({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: delay / 1000, duration: 0.3 }}
    className={className}
  >
    {children}
  </motion.div>
)

export default function PlatformDashboard() {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (platformId: string) => {
    const newExpandedRows = new Set(expandedRows)
    if (newExpandedRows.has(platformId)) {
      newExpandedRows.delete(platformId)
    } else {
      newExpandedRows.add(platformId)
    }
    setExpandedRows(newExpandedRows)
  }

  return (
    <div className={`min-h-screen   bg-transparent text-white  ${bigShoulders.className} `}>
      
      {/* Testimonials Section */}
      <section className="py-10">
        
        {/* Header Bar */}
        <div className="relative w-full max-w-[600px] mx-auto h-[60px]">
          {/* Left animated bar */}
          <div className="absolute left-0 top-[30px] w-[60%] sm:w-[110px]   overflow-hidden rounded-full">
            <motion.div
              className="w-full h-[3px] bg-gradient-to-l from-[#FFFF00] to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
            />
          </div>

          {/* Right animated bar */}
          <div className="absolute right-0 top-[30px] w-[60%] sm:w-[110px]   overflow-hidden rounded-full">
            <motion.div
              className="w-full h-[3px] bg-gradient-to-r from-[#FFFF00] to-transparent"
              initial={{ x: "100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
            />
          </div>

          {/* Central blurred glow */}
          <div className="absolute left-1/2 -translate-x-1/2 top-[30px] w-[60px] h-[3px] bg-[#FFFF00] blur-[30px]"></div>

          {/* Center label with glow */}
          <div className="absolute left-1/2 -translate-x-1/2 top-3">
            <div className="relative">
              <div className="absolute -inset-1 bg-[#FFFF00]/30 blur-[25px]"></div>
              <div
                className="relative text-xl sm:text-2xl tracking-wider font-semibold text-[#FFFF00]"
                style={{
                  textShadow: "0 0 12px #FFFF00, 0 0 24px rgba(255, 255, 0, 0.6)",
                }}
              >
                Undetectable
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        
      </section>
<div className="mt-14 text-center ">
              <h1 className="text-white md:text-[2.7rem] text-[2rem] font-semibold">Does it <span className="text-[#FFFF00] italic">work</span> and is it detectable?</h1>
              <p className="text-white font-sans text-[1rem] mt-7 font-normal px-6 max-w-xl mx-auto">
                <span className="text-[#FFFF00] italic">Na modda</span> bhi kanipiyadu. I have tested it on all the
                proctoring platforms and test environments — AI can&#39;t detect anything. So don&#39;t worry, it is safe.
              </p>
            </div>
      {/* Platform Dashboard Section */}
      <section className="py-10">
        <div className="w-full max-w-4xl mx-auto  rounded-lg overflow-hidden">
          {/* Platform List */}
          <div className="divide-y divide-gray-800">
            {platforms.map((platform, index) => {
              const isExpanded = expandedRows.has(platform.id)
              return (
                <div key={platform.id} className="border-b font-sans border-gray-800 last:border-b-0">
                  <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-800/50 transition-colors">
                    {/* Left Section: Number, Icon, Name */}
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-500 font-mono text-sm w-8">{platform.number}</span>
                      <div className="w-6 h-6 flex-shrink-0">
                       
                      </div>
                      <span className="text-white font-medium text-base">{platform.name}</span>
                    </div>

                    {/* Right Section: Status Badge and Dropdown */}
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          platform.status === "Undetectable"
                            ? "bg-green-600/20 text-green-400 border border-green-600/30"
                            : "bg-yellow-600/20 text-yellow-400 border border-yellow-600/30"
                        }`}
                      >
                        {platform.status}
                      </span>
                      <button
                        onClick={() => toggleRow(platform.id)}
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                      >
                        <ChevronDown
                          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Expandable Content */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-4 bg-gray-800/30 rounded-lg"
                    >
                      <div className="pl-12 space-y-2">
                        <div className="text-sm text-gray-300">
                          <span className="text-gray-400">Platform Type:</span>{" "}
                          {platform.name === "Microsoft Teams" ||
                          platform.name === "Google Meet" ||
                          platform.name === "Chime"
                            ? "Video Conferencing"
                            : "Coding Assessment"}
                        </div>
                        <div className="text-sm text-gray-300">
                          <span className="text-gray-400">Detection Method:</span>{" "}
                          {platform.status === "Undetectable"
                            ? "Advanced bypass techniques applied"
                            : "Limited detection avoidance"}
                        </div>
                        <div className="text-sm text-gray-300">
                          <span className="text-gray-400">Last Updated:</span> {new Date().toLocaleDateString()}
                        </div>
                        {platform.status === "Conditional" && (
                          <div className="text-sm text-[#f0f810] mt-2">
                            <span className="text-gray-400">Note:</span> This platform requires specific configuration
                            for optimal performance.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Warning Message */}
          <div className="px-6 py-4 border-t border-gray-800">
            <p className="text-gray-400 text-lg text-center leading-relaxed">
              <span className="text-[#f0f810] ">Warning:</span> {" "}
              MacOS version is still under development
              {" "}
            
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}