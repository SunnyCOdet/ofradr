"use client"

import type React from "react"

import { motion } from "framer-motion"
import { useState } from "react"
import { Big_Shoulders_Display } from "next/font/google"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, MessageSquare, Send, CheckCircle } from "lucide-react"
import CenteredLottieNavbar from "@/sections/Header"
import { Footer } from "../experiment/Footer"
import { TypingAnimation } from "@/components/magicui/typing-animation"
import GlassNavbar from "../experiment/Navbar"
const bigShoulders = Big_Shoulders_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
})

interface FormData {
  email: string
  subject: string
  message: string
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [buttonClicked, setButtonClicked] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }


  
 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setButtonClicked(true)
  setIsSubmitting(true)

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })

    if (!res.ok) {
      throw new Error("Failed to submit the form")
    }

    setIsSubmitted(true)
  } catch (error) {
    console.error("Form submission error:", error)
    alert("There was an error submitting the form. Please try again.")
  } finally {
    setIsSubmitting(false)

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setButtonClicked(false)
      setFormData({ email: "", subject: "", message: "" })
    }, 3000)
  }
}

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  }

  return (
    <div className="bg-black min-h-screen overflow-hidden flex flex-col">
<div>
    <GlassNavbar/>
</div>
      <div className="mt-36">
        <div className="flex-1 flex items-center  justify-center px-4 py-8">
        <motion.div className="w-full max-w-4xl" variants={containerVariants} initial="hidden" animate="visible">
          {/* Header */}
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <h1 className={`text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 ${bigShoulders.className}`}>
             Lets <span className="text-[#ea3a59]">TALK</span>
            </h1>
            <motion.div className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto" variants={itemVariants}>
             <TypingAnimation> 
              Have a question, feedback, or just want to say hello? Wed love to hear from you.
            </TypingAnimation>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div variants={itemVariants}>
            <Card className="border border-[#ea3a59] shadow-2xl bg-gray-900/50 backdrop-blur-sm">
              <CardContent className="p-6 md:p-8 lg:p-12">
                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Email Field */}
                      <motion.div className="space-y-2" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                        <label
                          htmlFor="email"
                          className={`block text-[#ea3a59] font-semibold ${bigShoulders.className} tracking-wide`}
                        >
                          <Mail className="inline w-4 h-4 mr-2" />
                          EMAIL ADDRESS
                        </label>
                        <motion.input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField("email")}
                          onBlur={() => setFocusedField(null)}
                          required
                          className="w-full px-4 py-3 bg-black border-2 border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-[#ea3a59] focus:outline-none transition-all duration-300"
                          placeholder="your.email@example.com"
                          whileFocus={{
                            scale: 1.02,
                            boxShadow: "0 0 20px rgba(255, 255, 0, 0.3)",
                          }}
                          transition={{ duration: 0.2 }}
                        />
                      </motion.div>

                      {/* Subject Field */}
                      <motion.div className="space-y-2" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                        <label
                          htmlFor="subject"
                          className={`block text-[#ea3a59] font-semibold ${bigShoulders.className} tracking-wide`}
                        >
                          <MessageSquare className="inline w-4 h-4 mr-2" />
                          SUBJECT
                        </label>
                        <motion.input
                          type="text"
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField("subject")}
                          onBlur={() => setFocusedField(null)}
                          required
                          className="w-full px-4 py-3 bg-black border-2 border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-[#ea3a59] focus:outline-none transition-all duration-300"
                          placeholder="What's this about?"
                          whileFocus={{
                            scale: 1.02,
                            boxShadow: "0 0 20px rgba(255, 255, 0, 0.3)",
                          }}
                          transition={{ duration: 0.2 }}
                        />
                      </motion.div>
                    </div>

                    {/* Message Field */}
                    <motion.div className="space-y-2" whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                      <label
                        htmlFor="message"
                        className={`block text-[#ea3a59] font-semibold ${bigShoulders.className} tracking-wide`}
                      >
                        YOUR MESSAGE
                      </label>
                      <motion.textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField("message")}
                        onBlur={() => setFocusedField(null)}
                        required
                        rows={6}
                        className="w-full px-4 py-3 bg-black border-2 border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-[#ea3a59] focus:outline-none transition-all duration-300 resize-none"
                        placeholder="Tell us what's on your mind..."
                        whileFocus={{
                          scale: 1.01,
                          boxShadow: "0 0 20px rgba(255, 255, 0, 0.3)",
                        }}
                        transition={{ duration: 0.2 }}
                      />
                    </motion.div>

                    {/* Character Count */}
                    <motion.div
                      className="flex justify-between text-sm text-gray-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: formData.message.length > 0 ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span>Characters: {formData.message.length}</span>
                      <span>
                        Words:{" "}
                        {
                          formData.message
                            .trim()
                            .split(/\s+/)
                            .filter((word) => word.length > 0).length
                        }
                      </span>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div
                      className="flex justify-center pt-4"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        type="submit"
                        disabled={false}
                        className={`
                          bg-[#ea3a59] text-black font-bold px-8 py-3 rounded-lg
                          hover:bg-[#ea3a59]/90 transition-all duration-300
                          disabled:opacity-50 disabled:cursor-not-allowed
                          ${bigShoulders.className} tracking-wide text-lg
                          shadow-lg hover:shadow-[#ea3a59]/50 relative overflow-hidden
                        `}
                      >
                        {isSubmitting ? (
                          <motion.div
                            className="flex items-center gap-2"
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                          >
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            SENDING...
                          </motion.div>
                        ) : (
                          <div className="flex items-center gap-2 relative">
                            <motion.div
                              animate={
                                isSubmitting
                                  ? {
                                      y: [-20, -40, -60],
                                      x: [0, 10, 20],
                                      rotate: [0, 15, 30],
                                      scale: [1, 0.8, 0.6],
                                      opacity: [1, 0.8, 0],
                                    }
                                  : { y: 0, x: 0, rotate: 0, scale: 1, opacity: 1 }
                              }
                              transition={{
                                duration: 0.8,
                                ease: "easeOut",
                                times: [0, 0.5, 1],
                              }}
                            >
                              <Send className="w-5 h-5" />
                            </motion.div>
                            {/* Rocket trail effect */}
                            {isSubmitting && (
                              <motion.div
                                className="absolute -top-2 -left-2"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                  opacity: [0, 1, 0],
                                  scale: [0, 1.5, 2],
                                  y: [0, -10, -20],
                                }}
                                transition={{
                                  duration: 0.6,
                                  delay: 0.2,
                                  ease: "easeOut",
                                }}
                              >
                                <div className="w-2 h-2 bg-[#ea3a59] rounded-full blur-sm" />
                              </motion.div>
                            )}
                            {/* Success particles */}
                            {isSubmitted && (
                              <>
                                {[...Array(5)].map((_, i) => (
                                  <motion.div
                                    key={i}
                                    className="absolute w-1 h-1 bg-[#ea3a59] rounded-full"
                                    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                                    animate={{
                                      opacity: [0, 1, 0],
                                      scale: [0, 1, 0],
                                      x: [0, (i - 2) * 20],
                                      y: [0, -15 - i * 5],
                                    }}
                                    transition={{
                                      duration: 1,
                                      delay: i * 0.1,
                                      ease: "easeOut",
                                    }}
                                  />
                                ))}
                              </>
                            )}
                            SEND MESSAGE
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                ) : (
                  // Success Message
                  <motion.div
                    className="text-center py-12"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                      <CheckCircle className="w-16 h-16 text-[#ea3a59] mx-auto mb-4" />
                    </motion.div>
                    <h2 className={`text-3xl font-bold text-white mb-2 ${bigShoulders.className}`}>MESSAGE SENT!</h2>
                    <p className="text-gray-300 text-lg">Thanks for reaching out! We will get back to you soon.</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Info */}
          <motion.div className="grid md:grid-cols-3 gap-6 mt-12" variants={containerVariants}>
            <motion.div
              className="text-center p-6 bg-gray-900/30 rounded-lg border border-[#ea3a59]/30"
              variants={itemVariants}
              whileHover={{ scale: 1.05, borderColor: "#ea3a59" }}
              transition={{ duration: 0.3 }}
            >
              <Mail className="w-8 h-8 text-[#ea3a59] mx-auto mb-3" />
              <h3 className={`text-white font-bold mb-2 ${bigShoulders.className}`}>EMAIL US</h3>
              <p className="text-gray-300 text-sm">support@Ofradr.com</p>
            </motion.div>

            <motion.div
              className="text-center p-6 bg-gray-900/30 rounded-lg border border-[#ea3a59]/30"
              variants={itemVariants}
              whileHover={{ scale: 1.05, borderColor: "#ea3a59" }}
              transition={{ duration: 0.3 }}
            >
              <MessageSquare className="w-8 h-8 text-[#ea3a59] mx-auto mb-3" />
              <h3 className={`text-white font-bold mb-2 ${bigShoulders.className}`}>LIVE CHAT</h3>
              <p className="text-gray-300 text-sm">Available 24/7</p>
            </motion.div>

            <motion.div
              className="text-center p-6 bg-gray-900/30 rounded-lg border border-[#ea3a59]/30"
              variants={itemVariants}
              whileHover={{ scale: 1.05, borderColor: "#ea3a59" }}
              transition={{ duration: 0.3 }}
            >
              <Send className="w-8 h-8 text-[#ea3a59] mx-auto mb-3" />
              <h3 className={`text-white font-bold mb-2 ${bigShoulders.className}`}>RESPONSE TIME</h3>
              <p className="text-gray-300 text-sm">Within 24 hours</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      </div>
      <Footer/>
          </div>
  )
}
