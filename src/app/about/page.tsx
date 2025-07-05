"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Shield, Zap, Eye, Keyboard, Bot } from "lucide-react"
import { Big_Shoulders_Display } from "next/font/google"
import Image from "next/image"

import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import { Footer } from "../experiment/Footer"
const bigShoulders = Big_Shoulders_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
})

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5 },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12 flex flex-row items-center justify-center "
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <h1 className={`text-5xl font-bold text-white ${bigShoulders.className}`}>About</h1>
          
 <div>
      <Image src="/logo.png" alt="Logo" width={80} height={80} />
    </div>
        </motion.div>

        {/* What is Ofradr */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.3 }}
          className="mb-12"
        >
          <Card className="border border-[#ea3a59] shadow-lg bg-gray-900">
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 text-2xl text-white ${bigShoulders.className}`}>
                <Bot className="h-6 w-6 text-[#ea3a59]" />
                What is Ofradr?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 leading-relaxed">
              <p className="mb-4">
                Ofradr is an innovative coding assistant that operates as your invisible helper during Mock
                assessments. Think of it as your secret weapon for coding practice - a sophisticated tool that combines AI
                intelligence with stealth operation to provide coding assistance when you need it most.
              </p>
              <p>
                The application runs silently in the background, ready to analyze coding problems through screenshots
                and provide intelligent solutions using Google Gemini AI, all while maintaining complete discretion.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Key Features */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          className="mb-12"
        >
          <h2 className={`text-3xl font-bold text-center mb-8 text-white ${bigShoulders.className}`}>Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <Card className="border border-[#ea3a59] shadow-lg hover:shadow-xl hover:shadow-[#ea3a59]/20 transition-all duration-300 bg-gray-900">
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 text-white ${bigShoulders.className}`}>
                    <Eye className="h-5 w-5 text-[#ea3a59]" />
                    Stealth Mode
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Operates completely invisibly in the background. No visible windows or indicators during operation.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <Card className="border border-[#ea3a59] shadow-lg hover:shadow-xl hover:shadow-[#ea3a59]/20 transition-all duration-300 bg-gray-900">
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 text-white ${bigShoulders.className}`}>
                    <Keyboard className="h-5 w-5 text-[#ea3a59]" />
                    Keyboard Shortcuts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Control everything with simple keyboard combinations. Alt+S for screenshots, Ctrl+Enter to send.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <Card className="border border-[#ea3a59] shadow-lg hover:shadow-xl hover:shadow-[#ea3a59]/20 transition-all duration-300 bg-gray-900">
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 text-white ${bigShoulders.className}`}>
                    <Zap className="h-5 w-5 text-[#ea3a59]" />
                    AI-Powered
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Leverages Google Gemini AI to analyze coding problems and provide intelligent solutions.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.3 }}
          className="mb-12"
        >
          <Card className="border border-[#ea3a59] shadow-lg bg-gray-900">
            <CardHeader>
              <CardTitle className={`text-2xl text-white ${bigShoulders.className}`}>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Badge variant="outline" className="mt-1 border-[#ea3a59] text-[#ea3a59]">
                    1
                  </Badge>
                  <div>
                    <h3 className={`font-semibold mb-2 text-white ${bigShoulders.className}`}>Take a Screenshot</h3>
                    <p className="text-gray-300">Press Alt+S to capture the coding problem on your screen</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Badge variant="outline" className="mt-1 border-[#ea3a59] text-[#ea3a59]">
                    2
                  </Badge>
                  <div>
                    <h3 className={`font-semibold mb-2 text-white ${bigShoulders.className}`}>Send to AI</h3>
                    <p className="text-gray-300">Press Ctrl+Enter to send the screenshot to Gemini AI for analysis</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Badge variant="outline" className="mt-1 border-[#ea3a59] text-[#ea3a59]">
                    3
                  </Badge>
                  <div>
                    <h3 className={`font-semibold mb-2 text-white ${bigShoulders.className}`}>Get Your Solution</h3>
                    <p className="text-gray-300">Press Alt+H to view the solution, then Alt+V to paste it naturally</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Operating Modes */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.3 }}
          className="mb-12"
        >
          <Card className="border border-[#ea3a59] shadow-lg bg-gray-900">
            <CardHeader>
              <CardTitle className={`text-2xl text-white ${bigShoulders.className}`}>Operating Modes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-800 border border-[#ea3a59]/30 rounded-lg">
                  <h3 className={`font-semibold text-[#ea3a59] mb-2 ${bigShoulders.className}`}>Coding Practice Mode</h3>
                  <p className="text-gray-300">
                    Ultra-stealth mode for coding assessments. Completely invisible operation with keyboard-only
                    control.
                  </p>
                </div>
                <div className="p-4 bg-gray-800 border border-[#ea3a59]/30 rounded-lg">
                  <h3 className={`font-semibold text-[#ea3a59] mb-2 ${bigShoulders.className}`}>
                    Mock Interview Mode
                  </h3>
                  <p className="text-gray-300">
                    Interactive mode for Mock interviews. Allows visible window interaction for custom questions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Legal Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.3 }}
          className="mb-8"
        >
          <Card className="border-2 border-red-500 bg-red-950 shadow-lg">
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 text-red-400 ${bigShoulders.className}`}>
                <AlertTriangle className="h-6 w-6" />
                Important Legal Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-red-300">
              <div className="p-4 bg-red-900/50 border border-red-500/30 rounded-lg">
                <h3 className={`font-semibold mb-2 text-[#ea3a59] ${bigShoulders.className}`}>Responsible Use Only</h3>
                <p>
                  Ofradr is intended for educational purposes, practice sessions, and legitimate Mock preparation.
                  Users are strictly prohibited from using this software for:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Cheating on official examinations or assessments</li>
                  <li>Violating academic integrity policies</li>
                  <li>Circumventing security measures in professional testing environments</li>
                  <li>Any form of academic or professional dishonesty</li>
                </ul>
              </div>

              <div className="p-4 bg-red-900/50 border border-red-500/30 rounded-lg">
                <h3 className={`font-semibold mb-2 text-[#ea3a59] ${bigShoulders.className}`}>
                  Limitation of Liability
                </h3>
                <p>
                  <strong className="text-white">
                    The developers and distributors of Ofradr are not responsible for any illegal, unethical, or
                    inappropriate use of this software.
                  </strong>{" "}
                  Users assume full responsibility for their actions and any consequences that may arise from the use of
                  this application.
                </p>
              </div>

              <div className="p-4 bg-red-900/50 border border-red-500/30 rounded-lg">
                <h3 className={`font-semibold mb-2 text-[#ea3a59] ${bigShoulders.className}`}>User Responsibility</h3>
                <p>
                  By using Ofradr, you acknowledge that you understand and agree to use this software ethically and in
                  compliance with all applicable laws, regulations, and institutional policies. You are solely
                  responsible for ensuring your use of this software does not violate any terms of service, academic
                  policies, or legal requirements.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Ethical Use Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <Card className="border-2 border-[#ea3a59] bg-gray-900 shadow-lg">
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 text-[#ea3a59] ${bigShoulders.className}`}>
                <Shield className="h-6 w-6" />
                Ethical Use Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              <p className="mb-4">We encourage the responsible use of Ofradr for legitimate purposes such as:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Personal coding practice and skill development</li>
                <li>Learning new programming concepts and techniques</li>
                <li>Preparing for Mock interviews in a practice environment</li>
                <li>Educational exploration and experimentation</li>
                <li>Debugging and understanding complex code structures</li>
              </ul>
              <p className="mt-4 font-semibold text-[#ea3a59]">
                Remember: True skill development comes from understanding and practice, not from shortcuts.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <Footer/>
    </div>
  )
}
