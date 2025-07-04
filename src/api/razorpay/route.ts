// src/pages/api/razorpay.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: "rzp_test_4AXuYqwqrgYed3",       // server‑side secret
  key_secret: "TsYaT16geCx3Hsy0eZjbCjuT",
});

/**
 * POST /api/razorpay
 * Creates and returns a Razorpay order object.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const order = await razorpay.orders.create({
      amount: 499 * 100,          // ₹4.99 in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      payment_capture: true,
    });
    res.status(200).json(order);
  } catch (err) {
    console.error("Razorpay order error:", err);
    res.status(500).json({ error: "Unable to create order" });
  }
}
