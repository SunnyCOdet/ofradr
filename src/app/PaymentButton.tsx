// src/components/PaymentButton.tsx
"use client";

import { loadRazorpayScript } from "@/utils/loadRazorpay";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentButton() {
  const handlePayment = async () => {
    const sdkLoaded = await loadRazorpayScript();
    if (!sdkLoaded) {
      alert("Failed to load Razorpay SDK.");
      return;
    }

    // Create order via our API route
    const order = await fetch("/api/razorpay", { method: "POST" }).then((r) => r.json());

    const rzp = new window.Razorpay({
      key: "rzp_test_4AXuYqwqrgYed3", // public key
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,
      name: "My Shop",
      description: "Test transaction",
      handler: (response: any) => {
        alert(`✅ Payment success! ID: ${response.razorpay_payment_id}`);
        // TODO: POST response to /api/verify for signature verification
      },
      prefill: {
        name: "Sat B",
        email: "test@example.com",
        contact: "9999999999",
      },
      theme: { color: "#3399cc" },
    });

    rzp.open();
  };

  return (
    <button
      onClick={handlePayment}
      className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
    >
      Pay ₹4.99
    </button>
  );
}
