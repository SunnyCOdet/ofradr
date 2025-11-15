"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"

export default function WaitlistForm() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showStrike, setShowStrike] = useState(false)
  const [typingText, setTypingText] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const fullText = "OFRADR MAX"
  const baseText = "OFRADR"

  useEffect(() => {
    // Try to get user info from localStorage
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user")
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr)
          setUsername(parsed.username || "")
          setEmail(parsed.email || "")
        } catch {}
      }
    }
  }, [])

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

  const handleInputChange = (field: string, value: string) => {
    if (field === "username") {
      setUsername(value)
    } else if (field === "email") {
      setEmail(value)
    }
    setError("")
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setIsLoading(true)

    if (!username.trim() || !email.trim()) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    // Only allow Gmail addresses
    if (!email.trim().toLowerCase().endsWith("@gmail.com")) {
      setError("Only Gmail addresses are allowed for the waitlist")
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to join waitlist")
      }

      setSuccess(true)
      setUsername("")
      setEmail("")
      
      // Redirect to home page after 2 seconds
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <Card className="bg-black/40 border-red-500/20 backdrop-blur-xl">
        <CardHeader className="text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <CardTitle className="text-3xl font-bold text-white mb-2">
              Introducing{" "}
              <span className="inline-block">
                {showStrike && (
                  <span className="line-through text-white/60 mr-2">{baseText}</span>
                )}
                {typingText && (
                  <span className="text-red-500">
                    {typingText}
                    {showCursor && <span className="animate-pulse">|</span>}
                  </span>
                )}
              </span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              The best update ofradr can ever have. Join the waitlist to be among the first to experience the future.
            </CardDescription>
          </motion.div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <Label htmlFor="username" className="text-gray-300">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                required
                value={username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className="bg-black/50 border-red-500/30 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500/20"
                disabled={isLoading}
              />
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your Gmail address"
                required
                value={email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="bg-black/50 border-red-500/30 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500/20"
                disabled={isLoading}
              />
            </motion.div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-center text-sm font-semibold"
              >
                {error}
              </motion.div>
            )}

            {/* Success message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-green-400 text-center text-sm font-semibold"
              >
                 Successfully joined the waitlist!
              </motion.div>
            )}

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-700 hover:to-red-500 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <Mail className="w-5 h-5 mr-2" />
                    Join the Waitlist
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

