"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRef } from "react";

interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
  oauthProvider?: string;
  createdAt: string;
  updatedAt?: string;
}

interface AuditLog {
  _id: string;
  timestamp: string;
  actorId: string;
  targetUserId: string;
  action: string;
  details: Record<string, any>;
}

export default function AdminUserPage() {
  const { data: session } = useSession();
  type SessionUserWithRole = typeof session extends { user: infer U } ? U & { role?: string; email?: string } : { role?: string; email?: string };
  const userWithRole = session?.user as SessionUserWithRole | undefined;
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [debug, setDebug] = useState("");
  const [popup, setPopup] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const popupTimeout = useRef<NodeJS.Timeout | null>(null);
  const [tab, setTab] = useState<'users' | 'audit'>('users');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState("");

  useEffect(() => {
    // Debug information
    setDebug(`Session: ${JSON.stringify(session, null, 2)}`);
    
    if (userWithRole?.role === "admin") {
      fetchUsers();
    } else if (session) {
      // setError(`Access denied. Your role is: ${session.user?.role || "undefined"}`); // Original line commented out
      setLoading(false);
    } else {
      // setError("No session found. Please sign in."); // Original line commented out
      setLoading(false);
    }
  }, [session]);

  const fetchUsers = async () => {
    try {
      console.log("Fetching users as admin...");
      const response = await fetch("/api/admin/users");
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response:", errorText);
        
        if (response.status === 403) {
          // setError("Access denied. Admin role required."); // Original line commented out
        } else {
          // setError(`Failed to load users. Status: ${response.status}`); // Original line commented out
        }
        return;
      }
      
      const data = await response.json();
      console.log("Users data:", data);
      setUsers(data.users);
    } catch (error) {
      console.error("Fetch error:", error);
      // setError("Failed to load users."); // Original line commented out
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    setUpdating(userId);
    try {
      const response = await fetch("/api/admin/users/role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setPopup({ message: errorData.error || "Failed to update role", type: "error" });
        if (popupTimeout.current) clearTimeout(popupTimeout.current);
        popupTimeout.current = setTimeout(() => setPopup(null), 3500);
        return;
      }

      // Update the user in the local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? { ...user, role: newRole } : user
        )
      );
      setPopup({ message: `Role updated to '${newRole}' successfully.`, type: "success" });
      if (popupTimeout.current) clearTimeout(popupTimeout.current);
      popupTimeout.current = setTimeout(() => setPopup(null), 2500);
    } catch {
      setPopup({ message: "Network error updating role", type: "error" });
      if (popupTimeout.current) clearTimeout(popupTimeout.current);
      popupTimeout.current = setTimeout(() => setPopup(null), 3500);
    } finally {
      setUpdating(null);
    }
  };

  const fetchAuditLogs = async () => {
    setAuditLoading(true);
    setAuditError("");
    try {
      const response = await fetch("/api/admin/audit-logs");
      if (!response.ok) {
        setAuditError("Failed to load audit logs");
        setAuditLoading(false);
        return;
      }
      const data = await response.json();
      setAuditLogs(data.logs);
    } catch {
      setAuditError("Network error loading audit logs");
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'audit' && auditLogs.length === 0 && userWithRole?.role === 'admin') {
      fetchAuditLogs();
    }
  }, [tab, userWithRole]);

  if (!session) {
    return (
      <div className="max-w-5xl mx-auto mt-10 p-6 bg-white shadow rounded">
        <h1 className="text-2xl font-semibold mb-4">User Management</h1>
        <p className="text-gray-600">Please sign in to access this page.</p>
      </div>
    );
  }

  if (userWithRole?.role !== "admin") {
    return (
      <div className="max-w-5xl mx-auto mt-10 p-6 bg-white shadow rounded">
        <h1 className="text-2xl font-semibold mb-4">User Management</h1>
        <p className="text-red-600">Access denied. Admin role required.</p>
        <p className="text-sm text-gray-600 mt-2">Your current role: {userWithRole?.role || "undefined"}</p>
        <details className="mt-4">
          <summary className="cursor-pointer text-blue-600">Debug Information</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
            {debug}
          </pre>
        </details>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto mt-10 p-6 bg-white shadow rounded">
        <h1 className="text-2xl font-semibold mb-4">User Management</h1>
        <p className="text-gray-600">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white shadow rounded">
      {popup && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white ${popup.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {popup.message}
        </div>
      )}
     <div className="mb-6 flex gap-4 border-b">
       <button
         className={`px-4 py-2 -mb-px border-b-2 font-medium ${tab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
         onClick={() => setTab('users')}
       >
         User Management
       </button>
       <button
         className={`px-4 py-2 -mb-px border-b-2 font-medium ${tab === 'audit' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
         onClick={() => setTab('audit')}
       >
         Audit Logs
       </button>
     </div>

     {tab === 'users' && (
        <>
          <h1 className="text-2xl font-semibold mb-4">User Management</h1>
      
      {/* {error && ( // Original line commented out */}
      {/*   <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded"> // Original line commented out */}
      {/*     {error} // Original line commented out */}
      {/*   </div> // Original line commented out */}
      {/* )} // Original line commented out */}

      <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
        <p className="text-sm">Logged in as: {userWithRole?.email} (Role: {userWithRole?.role || "undefined"})</p>
        <p className="text-sm">Total users loaded: {users.length}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left py-3 px-4 font-medium">Email</th>
              <th className="text-left py-3 px-4 font-medium">Name</th>
              <th className="text-left py-3 px-4 font-medium">Role</th>
              <th className="text-left py-3 px-4 font-medium">Auth Method</th>
              <th className="text-left py-3 px-4 font-medium">Created</th>
              <th className="text-left py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">{user.name || "N/A"}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === "admin" 
                      ? "bg-red-100 text-red-800" 
                      : user.role === "moderator"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {user.oauthProvider ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.oauthProvider}
                    </span>
                  ) : (
                    <span className="text-gray-500 text-xs">Email/Password</span>
                  )}
                </td>
                <td className="py-3 px-4 text-gray-600">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user._id, e.target.value)}
                    disabled={updating === user._id}
                    className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                  {updating === user._id && (
                    <span className="ml-2 text-xs text-gray-500">Updating...</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p>Total users: {users.length}</p>
        <p>Admins: {users.filter(u => u.role === "admin").length}</p>
        <p>Moderators: {users.filter(u => u.role === "moderator").length}</p>
        <p>Regular users: {users.filter(u => u.role === "user").length}</p>
      </div>

      <details className="mt-6">
        <summary className="cursor-pointer text-blue-600">Debug Information</summary>
        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
          {debug}
        </pre>
      </details>
        </>
      )}
     {tab === 'audit' && (
       <div>
         <h2 className="text-xl font-semibold mb-4">Audit Logs</h2>
         {auditLoading && <p>Loading audit logs...</p>}
         {auditError && <p className="text-red-600">{auditError}</p>}
         {!auditLoading && !auditError && (
           <div className="overflow-x-auto">
             <table className="w-full border-collapse text-xs">
               <thead>
                 <tr className="border-b bg-gray-50">
                   <th className="text-left py-2 px-3">Timestamp</th>
                   <th className="text-left py-2 px-3">Action</th>
                   <th className="text-left py-2 px-3">Actor</th>
                   <th className="text-left py-2 px-3">Target</th>
                   <th className="text-left py-2 px-3">Details</th>
                 </tr>
               </thead>
               <tbody>
                 {auditLogs.map(log => (
                   <tr key={log._id} className="border-b">
                     <td className="py-2 px-3 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                     <td className="py-2 px-3">{log.action}</td>
                     <td className="py-2 px-3">{log.actorId}</td>
                     <td className="py-2 px-3">{log.targetUserId}</td>
                     <td className="py-2 px-3">
                       <pre className="bg-gray-100 rounded p-1 overflow-x-auto max-w-xs whitespace-pre-wrap">{JSON.stringify(log.details, null, 2)}</pre>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         )}
       </div>
     )}
    </div>
  );
} 