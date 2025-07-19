"use client";
import UserProfile from "@/components/UserProfile";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
        <p className="text-gray-600">
          Welcome to your dashboard! This is a protected page that only authenticated users can access.
        </p>
      </div>
      
      <UserProfile />
    </div>
  );
}
