import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const client = await clientPromise;
  const db = client.db();
  const logs = await db.collection("audit_logs")
    .find({})
    .sort({ timestamp: -1 })
    .limit(100)
    .toArray();
  // Convert ObjectId fields to string for frontend
  const logsWithStringIds = logs.map(log => ({
    ...log,
    _id: log._id.toString(),
    actorId: log.actorId?.toString?.() || log.actorId,
    targetUserId: log.targetUserId?.toString?.() || log.targetUserId,
    timestamp: log.timestamp instanceof Date ? log.timestamp.toISOString() : log.timestamp,
  }));
  return NextResponse.json({ logs: logsWithStringIds });
} 