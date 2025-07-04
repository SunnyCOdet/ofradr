// src/app/api/razorpay/route.ts

import { NextRequest } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_4AXuYqwqrgYed3',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'TsYaT16geCx3Hsy0eZjbCjuT',
});

export async function POST(req: NextRequest) {
  try {
    // Optional: You can extract data from the request if needed
    // const body = await req.json();

    const order = await razorpay.orders.create({
      amount: 499 * 100, // ₹4.99 in paise
      currency: 'INR',
      receipt: `rcptid_${Date.now()}`,
      payment_capture: 1,
    });

    return new Response(JSON.stringify(order), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    return new Response(JSON.stringify({ error: 'Unable to create Razorpay order' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
