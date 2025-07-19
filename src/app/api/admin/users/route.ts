import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    console.log("Admin users API called");
    
    const session = await getServerSession(authOptions);
    console.log("Session:", session);
    console.log("Session user role:", session?.user?.role);
    
    if (!session || session.user.role !== "admin") {
      console.log("Access denied - not admin");
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    console.log("Admin access granted, fetching users...");
    const client = await clientPromise;
    const db = client.db();
    
    const users = await db
      .collection("users")
      .find({}, { 
        projection: { 
          _id: 1,
          email: 1,
          name: 1,
          role: 1,
          oauthProvider: 1,
          createdAt: 1,
          updatedAt: 1,
          image: 1
          // Note: password is automatically excluded when not included
        } 
      })
      .toArray();

    console.log(`Found ${users.length} users`);

    // Convert ObjectId to string for JSON serialization
    const serializedUsers = users.map(user => ({
      ...user,
      _id: user._id.toString(),
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: user.updatedAt?.toISOString() || null
    }));

    console.log("Returning users data");
    return NextResponse.json({ users: serializedUsers });
  } catch (error) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { userId, role } = await req.json();

    if (!userId || !role) {
      return NextResponse.json({ error: "User ID and role are required" }, { status: 400 });
    }

    if (!["user", "admin", "moderator"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          role: role,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User role updated successfully" });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 