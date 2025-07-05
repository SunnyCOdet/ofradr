// src/app/api/razorpay/route.ts

import { NextRequest } from 'next/server';
import Razorpay from 'razorpay';
const runtime = 'edge';
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID  ,
  key_secret: process.env.RAZORPAY_KEY_SECRET  ,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const amount = typeof body.amount === 'number' ? body.amount : 100; // fallback to 100 paise if not provided

    const order = await razorpay.orders.create({
      amount: amount, // amount in paise
      currency: 'INR',
      receipt: `rcptid_${Date.now()}`,
      payment_capture: true,
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
