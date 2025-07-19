import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import clientPromise from "@/lib/mongodb";

// ✅ Exportable config for getServerSession if needed elsewhere
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Missing email or password");
        }

        const client = await clientPromise;
        const db = client.db();
        const user = await db.collection("users").findOne({ email: credentials.email });

        if (!user) {
          throw new Error("User not found");
        }

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role || "user",
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }: { user: Record<string, unknown>; account: Record<string, unknown>; profile?: Record<string, unknown>; }) {
      if (account?.provider === "google") {
        const client = await clientPromise;
        const db = client.db();
        const users = db.collection("users");
        
        // Check if user already exists with this email
        const existingUser = await users.findOne({ email: user.email });
        
        if (existingUser) {
          // User exists - handle account merging
          if (!existingUser.oauthProvider) {
            // Existing credential user - link OAuth account
            await users.updateOne(
              { _id: existingUser._id },
              { 
                $set: { 
                  oauthProvider: account.provider,
                  googleId: profile?.sub,
                  image: user.image,
                  updatedAt: new Date()
                } 
              }
            );
            user.id = existingUser._id.toString();
            user.role = existingUser.role || "user";
            console.log(`Linked Google OAuth to existing credential account: ${user.email}`);
          } else if (existingUser.oauthProvider === account.provider) {
            // User already has this OAuth provider linked
            user.id = existingUser._id.toString();
            user.role = existingUser.role || "user";
            console.log(`Existing OAuth user signed in: ${user.email}`);
          } else {
            // Different OAuth provider - this could be handled differently
            console.log(`User ${user.email} has different OAuth provider`);
            user.id = existingUser._id.toString();
            user.role = existingUser.role || "user";
          }
        } else {
          // Create new user for Google OAuth
          const result = await users.insertOne({
            email: user.email,
            name: user.name,
            image: user.image,
            oauthProvider: account.provider,
            googleId: profile?.sub,
            role: "user", // Default role for OAuth users
            createdAt: new Date(),
          });
          user.id = result.insertedId.toString();
          user.role = "user";
          console.log(`Created new OAuth user: ${user.email}`);
        }
      }
      return true;
    },
    async jwt({ token, user }: { token: Record<string, unknown>; user: Record<string, unknown>; }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role || "user";
      }
      return token;
    },
    async session({ session, token }: { session: Record<string, unknown>; token: Record<string, unknown>; }) {
      if (token?.id) {
        session.user.id = token.id;
      }
      if (token?.email) {
        session.user.email = token.email;
      }
      if (token?.name) {
        session.user.name = token.name;
      }
      if (token?.role) {
        session.user.role = token.role;
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
