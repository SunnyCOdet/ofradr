"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Big_Shoulders_Display } from "next/font/google"
import PrismaticBurst from "@/components/PrismaticBurst"
import TargetCursor from "@/components/TargetCursor"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, MessageSquare, Send, CheckCircle, ArrowLeft } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const bigShoulders = Big_Shoulders_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
})

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  subject: z.string().min(3, {
    message: "Subject must be at least 3 characters.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
})

export default function ContactPage() {
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      subject: "",
      message: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!res.ok) {
        throw new Error("Failed to submit the form")
      }

      setIsSubmitted(true)
      form.reset()
    } catch (error) {
      console.error("Form submission error:", error)
      alert("There was an error submitting the form. Please try again.")
    } finally {
      setIsSubmitting(false)

      // Reset success message after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false)
      }, 3000)
    }
  }

  const handleContactClick = () => {
    setShowForm(true)
  }

  const handleBackClick = () => {
    setShowForm(false)
    setIsSubmitted(false)
    form.reset()
  }

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-black">
      {/* TargetCursor Component */}
      <TargetCursor targetSelector=".cursor-target" />

      {/* PrismaticBurst Background */}
      <div className="absolute inset-0 z-0">
        <PrismaticBurst
          intensity={2}
          speed={0.5}
          animationType="rotate3d"
          distort={5}
          mixBlendMode="lighten"
        />
      </div>

      <AnimatePresence mode="wait">
        {!showForm ? (
          // Initial "CONTACT US" Screen
          <motion.div
            key="contact-text"
            className="relative z-10 flex items-center justify-center w-full h-screen"
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 3 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <h1
              onClick={handleContactClick}
              className={`cursor-target cursor-pointer text-7xl md:text-9xl lg:text-[12rem] font-black text-white transition-all hover:scale-105 ${bigShoulders.className}`}
            >
              CONTACT US
            </h1>
          </motion.div>
        ) : (
          // Contact Form Screen
          <motion.div
            key="contact-form"
            className="relative z-10 flex items-center justify-center w-full min-h-screen px-4 py-12"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <div className="w-full max-w-2xl">
              {/* Back Button */}
              <motion.button
                onClick={handleBackClick}
                className={`cursor-target mb-6 flex items-center gap-2 text-white hover:text-[#ea3a59] transition-colors ${bigShoulders.className}`}
                whileHover={{ x: -5 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowLeft className="w-6 h-6" />
                <span className="text-xl">BACK</span>
              </motion.button>

              {/* Header */}
              <div className="text-center mb-8">
                <h1 className={`text-5xl md:text-7xl font-black text-white mb-4 ${bigShoulders.className}`}>
                  CONTACT <span className="text-[#ea3a59]">US</span>
                </h1>
                <p className="text-gray-300 text-lg">
                  Have a question? We'd love to hear from you.
                </p>
              </div>

              {/* Form Card */}
              <Card className="border border-[#ea3a59] shadow-2xl bg-gray-900/70 backdrop-blur-md">
                <CardContent className="p-6 md:p-8">
                  {!isSubmitted ? (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Email Field */}
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={`text-[#ea3a59] font-semibold ${bigShoulders.className} tracking-wide flex items-center gap-2`}>
                                <Mail className="w-4 h-4" />
                                EMAIL ADDRESS
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="your.email@example.com"
                                  className="bg-transparent border-2 border-gray-700 text-white placeholder-gray-400 focus:border-[#ea3a59] focus:ring-[#ea3a59]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />

                        {/* Subject Field */}
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={`text-[#ea3a59] font-semibold ${bigShoulders.className} tracking-wide flex items-center gap-2`}>
                                <MessageSquare className="w-4 h-4" />
                                SUBJECT
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="What's this about?"
                                  className="bg-transparent border-2 border-gray-700 text-white placeholder-gray-400 focus:border-[#ea3a59] focus:ring-[#ea3a59]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />

                        {/* Message Field */}
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={`text-[#ea3a59] font-semibold ${bigShoulders.className} tracking-wide`}>
                                YOUR MESSAGE
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Tell us what's on your mind..."
                                  className="bg-transparent border-2 border-gray-700 text-white placeholder-gray-400 focus:border-[#ea3a59] focus:ring-[#ea3a59] resize-none min-h-[150px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />

                        {/* Character Count */}
                        {form.watch("message") && (
                          <div className="flex justify-between text-sm text-gray-400">
                            <span>Characters: {form.watch("message").length}</span>
                            <span>
                              Words:{" "}
                              {form.watch("message").trim().split(/\s+/).filter((word) => word.length > 0).length}
                            </span>
                          </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-center pt-4">
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className={`
                              cursor-target bg-[#ea3a59] text-black font-bold px-8 py-3 rounded-lg
                              hover:bg-[#ea3a59]/90 transition-all duration-300
                              disabled:opacity-50 disabled:cursor-not-allowed
                              ${bigShoulders.className} tracking-wide text-lg
                              shadow-lg hover:shadow-[#ea3a59]/50
                            `}
                          >
                            {isSubmitting ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                SENDING...
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Send className="w-5 h-5" />
                                SEND MESSAGE
                              </div>
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
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
                      <h2 className={`text-3xl font-bold text-white mb-2 ${bigShoulders.className}`}>
                        MESSAGE SENT!
                      </h2>
                      <p className="text-gray-300 text-lg">
                        Thanks for reaching out! We'll get back to you soon.
                      </p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Info */}
              <div className="grid md:grid-cols-3 gap-4 mt-8">
                <motion.div
                  className="cursor-target text-center p-4 bg-gray-900/50 backdrop-blur-sm rounded-lg border border-[#ea3a59]/30"
                  whileHover={{ scale: 1.05, borderColor: "#ea3a59" }}
                  transition={{ duration: 0.3 }}
                >
                  <Mail className="w-8 h-8 text-[#ea3a59] mx-auto mb-2" />
                  <h3 className={`text-white font-bold mb-1 ${bigShoulders.className}`}>EMAIL US</h3>
                  <p className="text-gray-300 text-sm">support@ofradr.com</p>
                </motion.div>

                <motion.div
                  className="cursor-target text-center p-4 bg-gray-900/50 backdrop-blur-sm rounded-lg border border-[#ea3a59]/30"
                  whileHover={{ scale: 1.05, borderColor: "#ea3a59" }}
                  transition={{ duration: 0.3 }}
                >
                  <MessageSquare className="w-8 h-8 text-[#ea3a59] mx-auto mb-2" />
                  <h3 className={`text-white font-bold mb-1 ${bigShoulders.className}`}>LIVE CHAT</h3>
                  <p className="text-gray-300 text-sm">Available 24/7</p>
                </motion.div>

                <motion.div
                  className="cursor-target text-center p-4 bg-gray-900/50 backdrop-blur-sm rounded-lg border border-[#ea3a59]/30"
                  whileHover={{ scale: 1.05, borderColor: "#ea3a59" }}
                  transition={{ duration: 0.3 }}
                >
                  <Send className="w-8 h-8 text-[#ea3a59] mx-auto mb-2" />
                  <h3 className={`text-white font-bold mb-1 ${bigShoulders.className}`}>RESPONSE TIME</h3>
                  <p className="text-gray-300 text-sm">Within 24 hours</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
