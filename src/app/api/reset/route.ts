import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    // Check if user exists
    const user = await db.collection("users").findOne({ email });
    
    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({ 
        message: "If this email exists, a reset link has been sent." 
      });
    }

    // Generate secure token
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // Store reset token
    await db.collection("password_resets").insertOne({
      userId: user._id,
      token,
      expires,
      createdAt: new Date(),
    });

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(email, token);
    
    if (emailResult.success) {
      console.log('Email sent successfully!');
      console.log('Preview URL:', emailResult.previewUrl);
    } else {
      console.error('Email sending failed:', emailResult.error);
      // Still log the token for development
      console.log(`Reset token for ${email}: ${token}`);
      console.log(`Reset URL: https://full-stack-9rzy.vercel.app//reset/${token}`);
    }

    return NextResponse.json({ 
      message: "If this email exists, a reset link has been sent." 
    });
    
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json({ 
      message: "An error occurred. Please try again." 
    }, { status: 500 });
  }
} 