import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      authenticated: !!session,
      session: session,
      user: session?.user,
      role: session?.user?.role,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Debug user error:", error);
    return NextResponse.json({ error: "Failed to get session" }, { status: 500 });
  }
} 