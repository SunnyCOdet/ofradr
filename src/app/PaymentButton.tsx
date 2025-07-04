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

  const handlePayment = async () => {
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
      body: JSON.stringify({ amount: 1 }), // amount in paise
    }).then((r) => r.json())

    // Step 2: Open Razorpay checkout
    const rzp = new window.Razorpay({
      key: "razor_pay_keyId",
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,
      name: "My Shop",
      description: "Test transaction",
      handler: async (response: any) => {
        alert(`✅ Payment success! ID: ${response.razorpay_payment_id}`)

        // Step 3: Tier upgrade call to Supabase Edge Function
        try {
          const res = await fetch(
            "https://zryasugsrbzcraasgolv.supabase.co/functions/v1/tier-upgrade",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                username: "user",
                pro_tier: tier === "Freemium",
                elite_tier: tier === "Premium",
              }),
            }
          )

          const data = await res.json()

          if (!res.ok) {
            throw new Error(data.error || "Tier update failed")
          }

          console.log("Tier updated:", data)
          alert("✅ Tier successfully upgraded")
        } catch (err: any) {
          console.error("Tier upgrade error:", err.message)
          alert("⚠️ Tier upgrade failed")
        }
      },
      prefill: {
        name: "Sat B",
        email: "test@example.com",
        contact: "9555999999",
      },
      theme: { color: "#000000" },
    })

    rzp.open()
  }

  return (
    <button
      onClick={handlePayment}
      className="w-full py-4 font-semibold transition-all duration-300 backdrop-blur-sm border bg-black text-white border-none hover:bg-white/10 hover:border-white/30"
    >
      Pay ₹{price.toFixed(2)}
    </button>
  )
}
