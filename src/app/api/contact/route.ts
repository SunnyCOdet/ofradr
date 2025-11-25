import { dbConnect } from "@/lib/mongodb";
import User from "@/app/models/User";
import { NextResponse } from "next/server";
const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    await dbConnect();

    const { email, subject, message } = await request.json();

    const newUser = new User({ email, subject, message });
    await newUser.save();

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error("Error saving user:", error);

    // Return proper error response
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Duplicate entry: this email or username already exists." },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
