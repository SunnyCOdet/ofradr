"use client"

import { useEffect, useState } from "react"
import { loadRazorpayScript } from "@/utils/loadRazorpay"
import { createClient } from "@supabase/supabase-js"

// Setup Supabase client
const supabase = createClient(
  "https://zryasugsrbzcraasgolv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeWFzdWdzcmJ6Y3JhYXNnb2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MDg3ODcsImV4cCI6MjA2NDA4NDc4N30.GHX3YhaqtueL0n2WulPS6TPaFSwfR3mf0sfakB0TjUE"
)

interface PaymentButtonProps {
  price: number // in rupees
  tier: string
}

export default function PaymentButton({ price, tier }: PaymentButtonProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [user, setUser] = useState<{ username: string; email?: string } | null>(null)

  useEffect(() => {
    // Try to get user info from localStorage
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user")
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr)
          setUser(parsed)
        } catch {}
      }
    }

    // Listen for card click payment event
    const handler = async (evt: any) => {
      if (evt.detail && evt.detail.price === price && evt.detail.tier === tier) {
        await handlePayment()
      }
    }
    window.addEventListener("trigger-payment", handler)
    return () => window.removeEventListener("trigger-payment", handler)
    // eslint-disable-next-line
  }, [price, tier, user])

  const handlePayment = async () => {
    if (!user) {
      window.location.href = "/getin";
      return;
    }

    const sdkLoaded = await loadRazorpayScript()
    if (!sdkLoaded) {
      alert("❌ Failed to load Razorpay SDK.")
      return
    }

    // Step 1: Create Razorpay order
    const order = await fetch("/api/razorpay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: Math.round(price * 100) }), // amount in paise
    }).then((r) => r.json())

    // Step 2: Open Razorpay checkout
    const rzp = new window.Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,
      name: "Ofradr Inc",
      description: "Ofradr Payment",
      handler: async (response: any) => {
        alert(`✅ Payment success! ID: ${response.razorpay_payment_id}`)

        // Step 3: Tier upgrade call to Supabase Edge Function
        try {
          const res = await fetch(
            "https://zryasugsrbzcraasgolv.supabase.co/functions/v1/t-upgrade",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                username: user?.username,
                pro_tier: tier === "Pro",
                elite_tier: tier === "Elite",
              }),
            }
          )

          const data = await res.json()

          if (!res.ok) {
            throw new Error( "Tier update failed")
          }

          alert("✅ Tier successfully upgraded")
        } catch (err: any) {
          alert("⚠️ Tier upgrade failed")
        }
      },
      prefill: {
        name: user?.username || "Guest",
        email: user?.email || "",
        contact: "9999999999",
      },
      theme: { color: "#000000" },
    })

    rzp.open()
  }

  return (
    <button
      // Remove onClick, payment is handled by card click
      className="w-full py-4 font-semibold transition-all duration-300 backdrop-blur-sm border bg-black text-white border-none hover:bg-white/10 hover:border-white/30"
      tabIndex={-1} // Prevent button from being focused/clicked directly
      style={{ pointerEvents: "none" }}
    >
      ${price}
    </button>
  )
}
