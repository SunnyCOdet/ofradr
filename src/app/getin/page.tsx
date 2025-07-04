"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import LoginForm  from "./login"
import SignupForm from "./signup"
import OtpForm from "./otp"

export default function AuthPage() {
  const [currentView, setCurrentView] = useState<"login" | "signup" | "otp">("login")
  const [userEmail, setUserEmail] = useState("")
  const [userData, setUserData] = useState({
    username: "",
    password: "",
    geminiApiKey: "",
  })

  // Accepts all registration data
  const handleSignupSuccess = (email: string, username?: string, password?: string, geminiApiKey?: string) => {
    setUserEmail(email)
    setUserData({
      username: username || "",
      password: password || "",
      geminiApiKey: geminiApiKey || "",
    })
    setCurrentView("otp")
  }

  const handleOtpSuccess = () => {
    // On successful OTP verification, go to login form
    setCurrentView("login")
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Radial Background Gradients */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <AnimatePresence mode="wait">
          {currentView === "login" && <LoginForm key="login" onSwitchToSignup={() => setCurrentView("signup")} />}
          {currentView === "signup" && (
            <SignupForm
              key="signup"
              onSwitchToLogin={() => setCurrentView("login")}
              onSignupSuccess={(email, username, password, geminiApiKey) =>
                handleSignupSuccess(email, username, password, geminiApiKey)
              }
            />
          )}
          {currentView === "otp" && (
            <OtpForm
              key="otp"
              email={userEmail}
              username={userData.username}
              password={userData.password}
              geminiApiKey={userData.geminiApiKey}
              onOtpSuccess={handleOtpSuccess}
              onBack={() => setCurrentView("signup")}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
