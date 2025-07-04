"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Shield, RefreshCw } from "lucide-react"

interface OtpFormProps {
  email: string
  username: string
  password: string
  geminiApiKey: string
  onOtpSuccess: () => void
  onBack: () => void
}

export default function OtpForm({ email, username, password, geminiApiKey, onOtpSuccess, onBack }: OtpFormProps) {
  const [otp_hash, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [error, setError] = useState("")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newOtp = [...otp_hash]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp_hash[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const otp_hashCode = otp_hash.join("")
    if (otp_hashCode.length !== 6) {
      setError("Please enter the 6-digit code.")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("https://zryasugsrbzcraasgolv.supabase.co/functions/v1/register-otptest", {
        method: "POST",
        headers: {
          "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeWFzdWdzcmJ6Y3JhYXNnb2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MDg3ODcsImV4cCI6MjA2NDA4NDc4N30.GHX3YhaqtueL0n2WulPS6TPaFSwfR3mf0sfakB0TjUE`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          api_key: geminiApiKey,
          mail: email,
          user_otp: otp_hashCode,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Registration failed")
      onOtpSuccess()
    } catch (err: any) {
      setError(err.message || "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = () => {
    setTimeLeft(60)
    setOtp(["", "", "", "", "", ""])
    inputRefs.current[0]?.focus()
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
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-red-500/20 rounded-full">
                <Shield className="w-8 h-8 text-red-400" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-white mb-2">Verify Your Email</CardTitle>
            <CardDescription className="text-gray-400">
              We sent a 6-digit code to <span className="text-red-400 font-semibold">{email}</span>
            </CardDescription>
          </motion.div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center gap-3"
            >
              {otp_hash.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold bg-black/50 border-red-500/30 text-white focus:border-red-500 focus:ring-red-500/20"
                />
              ))}
            </motion.div>

            {/* Error message */}
            {error && (
              <div className="text-red-400 text-center text-sm font-semibold">{error}</div>
            )}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
              <Button
                type="submit"
                disabled={isLoading || otp_hash.join("").length !== 6}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  "Verify Code"
                )}
              </Button>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center space-y-4"
          >
            <div className="text-gray-400">
              {timeLeft > 0 ? (
                <p>Resend code in {timeLeft}s</p>
              ) : (
                <button
                  onClick={handleResend}
                  className="text-red-400 hover:text-red-300 font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} />
                  Resend Code
                </button>
              )}
            </div>

            <button
              onClick={onBack}
              className="text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Sign Up
            </button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
