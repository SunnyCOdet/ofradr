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
import { useCallback } from "react"
import { AnimatedGradientText } from "../../components/ui/animated-gradient-text"
import ElectricBorder from "../../components/ElectricBorder"

declare global {
  interface Window {
    Razorpay: any
  }
}

interface PaymentButtonProps {
  price: number // in rupees
}
// Put this above `export default function Component() { ... }`
function GlassDistortionFilter() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: "absolute" }}
      aria-hidden="true"
    >
      <defs>
        <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008 0.008"
            numOctaves={2}
            seed={92}
            result="noise"
          />
          <feGaussianBlur
            in="noise"
            stdDeviation={2}
            result="blurred"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurred"
            scale={150}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  )
}


export default function Component() {
  
  const plans = [
   
    {
      name: "Pro",
      price: "₹499",
      period: "/month",
      description: "Ideal for Easy and Medium Level Coding Rounds",
      features: [
        
        " No time limit on sessions",
        " Supports Gemini 2.5 Flash",
        " Fallback LLM support",
        " Partial Context Awareness",
        " No Audio/voice support",
        " Custom controls",
        " Medium Level Code Assistance with no Error Debugging",
        " Restricted Access to Elite models"
        
      ],
      rate:499,
      popular: true,
      buttonText: "Get started",
    },
    {
      name: "Elite",
      price: "₹1499",
      period: "/month",
      description: "Best suited for High Level Coding and Technical Mock Interviews",
      features: [
        " No time limit on sessions",
        " Supports Gemini 2.5 Pro/Flash",
        " Fallback LLM support",
        " Complete Context Awareness",
        "Audio/voice support",
        "High Level Code Assistance with Error Debugging",
        "Technical Interview Assistance",
        "Custom controls",
        "Complete Access to Elite models"
      ],
      rate:1499,
      popular: true,
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

  // Payment handler to trigger payment from card click
  const handleCardPayment = useCallback(async (price: number, tier: string) => {
    if (price === 0) {
      // Download the zip file for Free tier
      const link = document.createElement('a');
      link.href = '/ofradr.zip';
      link.download = 'ofradr.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    // Dynamically import the PaymentButton module to access the payment logic
    const mod = await import("../PaymentButton")
    // Trigger payment for paid tiers
    const evt = new CustomEvent("trigger-payment", { detail: { price, tier } })
    window.dispatchEvent(evt)
  }, [])

  return (
    <section id="pricing" className="scroll-mt-20">
    <div className="min-h-screen bg_transparent text-white relative  overflow-hidden">
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-transparent/5 backdrop-blur-sm border border-white/10 mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Sparkles className="w-4 h-4" style={{ color: "#ea3a59" }} />
            <span className="text-sm text-gray-300">Trusted by 500+ customers</span>
          </motion.div>
          <motion.h1
            className={`${bigShoulders.className} text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Choose Your <AnimatedGradientText colorFrom="#ea3a59" colorTo="#ff6b8a" className=" speed:{3} inline-block text-transparent bg-clip-text">Perfect Plan</AnimatedGradientText>
          </motion.h1>
          <motion.p
            className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
          If you can see it, Ofradr can help — and no one will ever notice.
          </motion.p>
        </motion.div>

        {/* Pricing Cards */}
        <GlassDistortionFilter />
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
                <ElectricBorder
                  color={plan.popular ? "#ea3a59" : "#ffffff"}
                  className="rounded-xl h-full"
                >
                <Card
                  className={`relative backdrop-blur-xl border-none text-white transition-all duration-300 group h-full
                  ${
                    plan.popular
                      ? "bg-[rgba(0,0,0,0.1)] hover:bg-transparent/5"
                      : "bg-[rgba(0,0,0,0.5)] hover:bg-transparent/5"
                  }`}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleCardPayment(plan.rate, plan.name)}
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
                                : "bg-transparent/20"
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
                      {/* The button is now just for style, payment is triggered by card click */}
                      <PaymentButton tier={plan.name} price={plan.rate} />
                    </motion.div>
                  </CardFooter>
                </Card>
                </ElectricBorder>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
    </section>
  )
}
