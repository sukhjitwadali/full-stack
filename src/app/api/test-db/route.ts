import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    console.log("Testing MongoDB connection...");
    
    const client = await clientPromise;
    const db = client.db();
    
    // Test basic connection
    const collections = await db.listCollections().toArray();
    console.log("Available collections:", collections.map(c => c.name));
    
    // Test users collection
    const userCount = await db.collection("users").countDocuments();
    console.log("User count:", userCount);
    
    // Get a sample user
    const sampleUser = await db.collection("users").findOne({}, { 
      projection: { password: 0, _id: 1, email: 1, role: 1 } 
    });
    
    return NextResponse.json({
      status: "success",
      connection: "ok",
      collections: collections.map(c => c.name),
      userCount: userCount,
      sampleUser: sampleUser ? {
        ...sampleUser,
        _id: sampleUser._id.toString()
      } : null
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}