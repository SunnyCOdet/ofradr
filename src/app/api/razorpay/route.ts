// src/app/api/razorpay/route.ts

import { NextRequest } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: NextRequest) {
  try {
    // Check for environment variables
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return new Response(JSON.stringify({ error: 'Razorpay credentials not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize Razorpay inside the function to avoid build-time errors
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

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
