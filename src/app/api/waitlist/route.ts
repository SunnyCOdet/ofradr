import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { username, email } = await request.json();

    if (!username || !email) {
      return NextResponse.json(
        { error: "Username and email are required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Only allow Gmail addresses
    if (!email.trim().toLowerCase().endsWith("@gmail.com")) {
      return NextResponse.json(
        { error: "Only Gmail addresses are allowed for the waitlist" },
        { status: 400 }
      );
    }

    // Call Supabase Edge Function
    const supabaseResponse = await fetch(
      "https://zryasugsrbzcraasgolv.supabase.co/functions/v1/subscribed",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeWFzdWdzcmJ6Y3JhYXNnb2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MDg3ODcsImV4cCI6MjA2NDA4NDc4N30.GHX3YhaqtueL0n2WulPS6TPaFSwfR3mf0sfakB0TjUE`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim().toLowerCase(),
          subscribed: true,
        }),
      }
    );

    const supabaseData = await supabaseResponse.json();

    if (!supabaseResponse.ok) {
      // Handle Supabase errors
      const errorMessage = supabaseData.error || supabaseData.message || "Failed to join waitlist";
      return NextResponse.json(
        { error: errorMessage },
        { status: supabaseResponse.status || 500 }
      );
    }

    // Check if Supabase returned success
    if (!supabaseData.success) {
      return NextResponse.json(
        { error: "Failed to join waitlist" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Successfully joined the waitlist!",
        success: true,
        data: supabaseData.inserted || {
          username: username.trim(),
          email: email.trim().toLowerCase(),
          subscribed: true,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error saving waitlist entry:", error);

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

