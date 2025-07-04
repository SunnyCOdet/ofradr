"use client"

import { useRef } from "react"
import { useInView, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Check, Sparkles } from "lucide-react"
import { Big_Shoulders_Display } from "next/font/google"

const bigShoulders = Big_Shoulders_Display({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
})

import { loadRazorpayScript } from "@/utils/loadRazorpay"
import PaymentButton from "../PaymentButton"

declare global {
  interface Window {
    Razorpay: any
  }
}

interface PaymentButtonProps {
  price: number // in rupees
}

export default function Component() {
  
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "Perfect for individuals getting started",
      features: ["Up to 100 complitions", "Basic model", "Basic support","Only code support"],
      popular: false,
      rate:0,
      buttonText: "Get Started",
    },
    {
      name: "Freemium",
      price: "$1.99",
      period: "/month",
      description: "Ideal for single cases",
      features: [
        
        "Unlimited completions",
        "Higher Model Support",
        "Multi llm support",
        "Fallback support",
        "Context Awareness",
        "Custom controls",
        
      ],
      rate:1.99,
      popular: true,
      buttonText: "Get started",
    },
    {
      name: "Premium",
      price: "$12.99",
      period: "/month",
      description: "For multiple use cases with advanced needs",
      features: [
        "Unlimited completions",
        "Higher Model Support",
        "Multi llm support",
        "Fallback support",
        "Context Awareness",
        "Audio/voice support",
        "Custom controls",
        "Access to premium models"
      ],
      rate:12.99,
      popular: false,
      buttonText: "Get started",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.4,
        delayChildren: 0.5,
      },
    },
  }

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 150,
      x: 0,
      scale: 0.6,
      rotateY: -25,
      rotateX: 15,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      rotateY: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 12,
        duration: 1.2,
      },
    },
  }

  const cardWrapperVariants = {
    hidden: {
      opacity: 0,
      y: 200,
      scale: 0.4,
      filter: "blur(10px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 15,
        duration: 1.5,
      },
    },
  }

  const headerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.6,
      },
    },
  }

  const featureVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  const featureListVariants = {
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  // In-view refs
  const headerRef = useRef(null)
  const isHeaderInView = useInView(headerRef, { once: false, amount: 0.3 })

  const cardContainerRef = useRef(null)
  const isCardContainerInView = useInView(cardContainerRef, { once: false, amount: 0.1 })

  return (
    <div className="min-h-screen bg-black text-white relative  overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            background: `radial-gradient(circle at center, rgba(234, 58, 89,0.2) 0%, transparent 50%)`,
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Header */}
        <motion.div
          ref={headerRef}
          className="text-center mb-16"
          variants={headerVariants}
          initial="hidden"
          animate={isHeaderInView ? "visible" : "hidden"}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Sparkles className="w-4 h-4" style={{ color: "#ea3a59" }} />
            <span className="text-sm text-gray-300">Trusted by 100+ customers</span>
          </motion.div>
          <motion.h1
            className={`${bigShoulders.className} text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Choose Your <span style={{ color: "#ea3a59" }}>Perfect Plan</span>
          </motion.h1>
          <motion.p
            className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
           Make your life even more private and chosse the most approrite option. Start free and upgrade as you grow.
          </motion.p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          ref={cardContainerRef}
          className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={isCardContainerInView ? "visible" : "hidden"}
        >
          {plans.map((plan, index) => (
            <motion.div key={plan.name} variants={cardWrapperVariants} className="relative">
              <motion.div
                variants={cardVariants}
                whileHover={{
                  scale: 1.08,
                  y: -15,
                  rotateY: 5,
                  transition: { type: "spring", stiffness: 300, damping: 20 },
                }}
                whileTap={{ scale: 0.95 }}
                style={{ perspective: "1000px" }}
              >
                <Card
                  className={`relative backdrop-blur-xl border border-white/10 text-white transition-all duration-300 group h-full
                  ${
                    plan.popular
                      ? "bg-[rgba(0,0,0,0.1)] hover:ring-2 hover:ring-[#ea3a59]/50 hover:bg-white/5 hover:shadow-2xl hover:shadow-[#ea3a59]/20"
                      : "bg-[rgba(0,0,0,0.5)] hover:bg-white/5 hover:border-white/20"
                  }`}
                >
                  <CardHeader className="text-center pb-8 relative">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.2, duration: 0.5 }}
                    >
                      <CardTitle className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        {plan.name}
                      </CardTitle>
                      <CardDescription className="text-gray-400 mb-6 leading-relaxed">
                        {plan.description}
                      </CardDescription>
                    </motion.div>
                    <motion.div
                      className="flex items-baseline justify-center"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: 1 + index * 0.2,
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                    >
                      <span
                        className={`text-5xl font-bold ${
                          plan.popular
                            ? "group-hover:bg-gradient-to-r group-hover:from-[#ea3a59] group-hover:to-[#ff6b8a] group-hover:bg-clip-text group-hover:text-transparent"
                            : "bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                        }`}
                      >
                        {plan.price}
                      </span>
                      <span className="text-gray-400 ml-2 text-lg">{plan.period}</span>
                    </motion.div>
                  </CardHeader>

                  <CardContent className="space-y-4 relative">
                    <motion.div
                      className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 1.2 + index * 0.2, duration: 0.6 }}
                    />
                    <motion.ul className="space-y-4" variants={featureListVariants} initial="hidden" animate="visible">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.li
                          key={featureIndex}
                          className="flex items-center group/item"
                          variants={featureVariants}
                          transition={{ delay: 1.4 + index * 0.2 + featureIndex * 0.1 }}
                        >
                          <motion.div
                            className={`w-5 h-5 mr-3 flex-shrink-0 rounded-full ${
                              plan.popular
                                ? "group-hover:bg-gradient-to-r group-hover:from-[#ea3a59] group-hover:to-[#ff6b8a]"
                                : "bg-white/20"
                            } flex items-center justify-center`}
                            whileHover={{ scale: 1.2, rotate: 360 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          >
                            <Check className="w-3 h-3 text-white" />
                          </motion.div>
                          <span className="text-gray-300 group-hover/item:text-white transition-colors duration-200">
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                    </motion.ul>
                  </CardContent>

                  <CardFooter className="pt-8">
                    <motion.div
                      className="w-full"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.8 + index * 0.2, duration: 0.5 }}
                    >
                      <PaymentButton price={plan.rate} />
                    </motion.div>
                  </CardFooter>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
