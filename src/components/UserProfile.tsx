"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

interface UserData {
  _id: string;
  email: string;
  name: string;
  oauthProvider?: string;
  googleId?: string;
  createdAt: string;
  updatedAt?: string;
}

export default function UserProfile() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserData();
    }
  }, [session]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/user/profile?email=${session?.user?.email}`);
      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
        <h2 className="text-xl font-semibold mb-4">User Profile</h2>
        <p className="text-gray-600">Please sign in to view your profile.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
        <h2 className="text-xl font-semibold mb-4">User Profile</h2>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-4">User Profile</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <p className="mt-1 text-gray-900">{session.user?.email}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <p className="mt-1 text-gray-900">{session.user?.name || "Not provided"}</p>
        </div>

        {userData && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Authentication Method</label>
              <div className="mt-1 flex items-center gap-2">
                {userData.oauthProvider ? (
                  <>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Google OAuth
                    </span>
                    {userData.googleId && (
                      <span className="text-xs text-gray-500">ID: {userData.googleId}</span>
                    )}
                  </>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Email & Password
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Account Created</label>
              <p className="mt-1 text-gray-900">
                {new Date(userData.createdAt).toLocaleDateString()}
              </p>
            </div>

            {userData.updatedAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                <p className="mt-1 text-gray-900">
                  {new Date(userData.updatedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 