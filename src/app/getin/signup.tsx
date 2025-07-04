"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, UserPlus, Key } from "lucide-react"

interface SignupFormProps {
  onSwitchToLogin: () => void
  onSignupSuccess: (email: string, username: string, password: string, geminiApiKey: string) => void
}

export default function SignupForm({ onSwitchToLogin, onSignupSuccess }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    geminiApiKey: "",
  })
  const [error, setError] = useState("")



  // Step 1: Send OTP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!")
      return
    }
    if (!formData.email.endsWith("@gmail.com")) {
      setError("A valid Gmail address is required.")
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch("https://zryasugsrbzcraasgolv.supabase.co/functions/v1/send-otp", {
        method: "POST",
        headers: {
          "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeWFzdWdzcmJ6Y3JhYXNnb2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MDg3ODcsImV4cCI6MjA2NDA4NDc4N30.GHX3YhaqtueL0n2WulPS6TPaFSwfR3mf0sfakB0TjUE`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to send OTP")
      onSignupSuccess(
        formData.email,
        formData.username,
        formData.password,
        formData.geminiApiKey
      )
    } catch (err: any) {
      setError(err.message || "Failed to send OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
            <CardTitle className="text-3xl font-bold text-white mb-2">Create Account</CardTitle>
            <CardDescription className="text-gray-400">Join us and get started</CardDescription>
          </motion.div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
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
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className="bg-black/50 border-red-500/30 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500/20"
              />
            </motion.div>

            {/* Email */}
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
                placeholder="Enter your email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="bg-black/50 border-red-500/30 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500/20"
              />
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-2"
            >
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="bg-black/50 border-red-500/30 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500/20 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </motion.div>

            {/* Confirm Password */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="space-y-2"
            >
              <Label htmlFor="confirmPassword" className="text-gray-300">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className="bg-black/50 border-red-500/30 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500/20 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </motion.div>

            {/* Gemini API Key */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="space-y-2"
            >
              <Label htmlFor="geminiApiKey" className="text-gray-300 flex items-center gap-2">
                <Key size={16} />
                Gemini API Key
              </Label>
              <Input
                id="geminiApiKey"
                type="text"
                placeholder="Enter your Gemini API key"
                required
                value={formData.geminiApiKey}
                onChange={(e) => handleInputChange("geminiApiKey", e.target.value)}
                className="bg-black/50 border-red-500/30 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500/20"
              />
            </motion.div>

            {/* Error message */}
            {error && (
              <div className="text-red-400 text-center text-sm font-semibold">{error}</div>
            )}

            {/* Submit Button */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-red-500 to-red-700  hover:from-red-700 hover:to-red-500 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-center"
          >
            <p className="text-gray-400">
              Already have an account?{" "}
              <button
                onClick={onSwitchToLogin}
                className="text-red-400 hover:text-red-300 font-semibold transition-colors"
              >
                Sign in
              </button>
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
