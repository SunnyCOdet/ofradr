"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function WaitlistModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasShown, setHasShown] = useState(false)

  useEffect(() => {
    // Check if modal was already shown in this session
    if (typeof window !== "undefined") {
      const shown = sessionStorage.getItem("waitlist-modal-shown")
      if (shown === "true") {
        return
      }
    }

    // Random delay between 5-10 seconds
    const delay = Math.random() * 5000 + 5000 // 5000ms to 10000ms

    const timer = setTimeout(() => {
      setIsOpen(true)
      setHasShown(true)
      if (typeof window !== "undefined") {
        sessionStorage.setItem("waitlist-modal-shown", "true")
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-transparent/80 backdrop-blur-sm z-[9998]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-md">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center text-white hover:bg-red-500/40 transition-colors backdrop-blur-sm"
              >
                <X size={18} />
              </button>

              {/* Modal Content */}
              <div className="bg-gradient-to-br from-black/95 via-black/90 to-red-950/30 border border-red-500/30 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                {/* Animated Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse delay-1000" />

                <div className="relative z-10">
                  {/* Main Message */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center text-gray-300 mb-4 text-xl font-semibold"
                  >
                    You&apos;re missing out on{" "}
                    <span className="text-red-400 font-bold">
                      <span className="line-through text-white/60">OFRADR</span>{" "}
                      <span className="text-red-500">OFRADR MAX</span>
                    </span>
                  </motion.p>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center text-gray-400 mb-6 text-sm leading-relaxed"
                  >
                    The best update ofradr can ever have. Join the waitlist now and be among the first to experience the future of AI-powered development.
                  </motion.p>

                  {/* CTA Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col gap-3"
                  >
                    <Link
                      href="/ofradr-max"
                      onClick={handleClose}
                      className="w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-red-500/50"
                    >
                      Join Waitlist
                      <ArrowRight size={18} />
                    </Link>
                    <button
                      onClick={handleClose}
                      className="w-full text-gray-400 hover:text-white text-sm py-2 transition-colors"
                    >
                      Maybe later
                    </button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

