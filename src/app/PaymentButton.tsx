"use client"

import { loadRazorpayScript } from "@/utils/loadRazorpay"

declare global {
  interface Window {
    Razorpay: any
  }
}

interface PaymentButtonProps {
  price: number // in rupees
}

export default function PaymentButton({ price }: PaymentButtonProps) {
  const handlePayment = async () => {
    const sdkLoaded = await loadRazorpayScript()
    if (!sdkLoaded) {
      alert("Failed to load Razorpay SDK.")
      return
    }

    // Create order via our API route and pass the price
    const order = await fetch("/api/razorpay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: price * 100 }), // Razorpay expects paise
    }).then((r) => r.json())

    const rzp = new window.Razorpay({
      key: "rzp_test_4AXuYqwqrgYed3",
      amount: 55,
      currency: order.currency,
      order_id: order.id,
      name: "My Shop",
      description: "Test transaction",
      handler: (response: any) => {
        alert(`✅ Payment success! ID: ${response.razorpay_payment_id}`)
        // TODO: POST response to /api/verify for signature verification
      },
      prefill: {
        name: "Sat B",
        email: "test@example.com",
        contact: "9555999999",
        amount:55,
      },
      theme: { color: "#00000" },
    })

    rzp.open()
  }

  return (
    <button
      onClick={handlePayment}
      className=" w-full py-4 font-semibold transition-all duration-300 backdrop-blur-sm border bg-black text-white border-none hover:bg-white/10 hover:border-white/30 "
    >
      Pay ${price.toFixed(2)}
    </button>
  )
}
