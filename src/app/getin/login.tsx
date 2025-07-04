"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, LogIn } from "lucide-react"

interface LoginFormProps {
  onSwitchToSignup: () => void
  onLoginSuccess?: (user: { username: string; apiKey: string }) => void
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup, onLoginSuccess }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ username: "", password: "" })
  const [error, setError] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      const res = await fetch("https://zryasugsrbzcraasgolv.supabase.co/functions/v1/login", {
        method: "POST",
        headers: {
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeWFzdWdzcmJ6Y3JhYXNnb2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MDg3ODcsImV4cCI6MjA2NDA4NDc4N30.GHX3YhaqtueL0n2WulPS6TPaFSwfR3mf0sfakB0TjUE",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "login", username: formData.username, password: formData.password }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || "Login failed")
      // Save user info to localStorage (optional)
      localStorage.setItem("user", JSON.stringify({ username: data.user.username, apiKey: data.apiKey }))
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
      if (typeof onLoginSuccess === "function") {
        onLoginSuccess({ username: data.user.username, apiKey: data.apiKey })
      }
    } catch (err: any) {
      setError(err.message || "Login failed")
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
            <CardTitle className="text-3xl font-bold text-white mb-2">Welcome Back</CardTitle>
            <CardDescription className="text-gray-400">Sign in to your account</CardDescription>
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
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className="bg-black/50 border-red-500/30 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500/20"
              />
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
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

            {/* Error message */}
            {error && (
              <div className="text-red-400 text-center text-sm font-semibold">{error}</div>
            )}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
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
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <p className="text-gray-400">
              {"Don't have an account? "}
              <button
                onClick={onSwitchToSignup}
                className="text-red-400 hover:text-red-300 font-semibold transition-colors"
              >
                Sign up
              </button>
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default LoginForm
