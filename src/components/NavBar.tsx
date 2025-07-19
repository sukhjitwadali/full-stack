"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function NavBar() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering session-dependent content until mounted
  if (!mounted) {
    return (
      <header className="bg-white shadow p-4">
        <nav className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex gap-4">
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
          </div>
          <div className="flex items-center gap-4">
            <span>Loading...</span>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="bg-white shadow p-4">
      <nav className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex gap-4">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          {session && <Link href="/dashboard">Dashboard</Link>}
          {session?.user?.role === "admin" && (
            <Link href="/admin/users" className="text-red-600 hover:text-red-800">
              Admin
            </Link>
          )}
        </div>
        <div className="flex items-center gap-4">
          {status === "loading" ? (
            <span>Loading...</span>
          ) : session ? (
            <>
              <span className="flex items-center gap-2">
                {session.user?.email}
                {session.user?.role && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    session.user.role === "admin" 
                      ? "bg-red-100 text-red-800" 
                      : session.user.role === "moderator"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}>
                    {session.user.role}
                  </span>
                )}
              </span>
              <button onClick={() => signOut({ callbackUrl: "/" })}>Logout</button>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
              <Link href="/reset" className="text-sm text-blue-600 hover:text-blue-800">
                Reset Password
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
