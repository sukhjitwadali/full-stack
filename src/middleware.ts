import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => {
      // For admin routes, check if user has admin role
      if (token?.role === "admin") {
        return true;
      }
      // For other protected routes, just check if user is authenticated
      return !!token;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/profile/:path*",
    "/admin/:path*" // Admin routes require admin role
  ],
};