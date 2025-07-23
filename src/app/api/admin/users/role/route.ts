import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { logAuditEvent } from "@/lib/audit";
import { sendSecurityEmail } from "@/lib/sendEmail";
// import { notifySlack } from "@/lib/notifySlack"; // Slack removed

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { userId, newRole } = await req.json();
  if (!userId || !newRole) {
    return NextResponse.json({ error: "User ID and newRole are required" }, { status: 400 });
  }
  if (!["admin", "user"].includes(newRole)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  // Prevent self-demotion
  if (session.user.id === userId && newRole !== "admin") {
    return NextResponse.json(
      { error: "Admins cannot demote themselves" },
      { status: 400 }
    );
  }

  const client = await clientPromise;
  const db = client.db();

  // Check if target user is the last admin
  const adminCount = await db.collection("users").countDocuments({ role: "admin" });
  const targetUser = await db.collection("users").findOne({ _id: new ObjectId(userId) });
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (
    targetUser.role === "admin" &&
    newRole !== "admin" &&
    adminCount === 1
  ) {
    return NextResponse.json(
      { error: "Cannot demote the last remaining admin" },
      { status: 400 }
    );
  }

  await db.collection("users").updateOne(
    { _id: new ObjectId(userId) },
    { $set: { role: newRole } }
  );

  // Audit log entry
  await logAuditEvent({
    actorId: session.user.id,
    action: "UPDATE_ROLE",
    targetUserId: userId,
    details: {
      previousRole: targetUser.role,
      newRole,
    },
  });

  // Only send security email notification
  console.log("About to send security email for role change...");
  await sendSecurityEmail(
    "Admin Role Change Detected",
    `${session.user.email} changed ${targetUser.email} from ${targetUser.role} to ${newRole} at ${new Date().toISOString()}`
  );
  console.log("Security email sent (or attempted) for role change.");

  return NextResponse.json({ success: true, role: newRole });
} 