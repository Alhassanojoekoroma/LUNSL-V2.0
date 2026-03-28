import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import AzureADProvider from "next-auth/providers/azure-ad";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  providers: [
    // ============================================================
    // OAUTH PROVIDERS
    // ============================================================
    
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),

    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),

    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "",
      tenantId: process.env.AZURE_AD_TENANT_ID,
      allowDangerousEmailAccountLinking: true,
    }),

    // ============================================================
    // EMAIL PROVIDER (For magic link authentication)
    // ============================================================
    
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      from: process.env.FROM_EMAIL || "noreply@luslnotepad.com",
      maxAge: 24 * 60 * 60, // Link valid for 24 hours
    }),

    // ============================================================
    // CREDENTIALS PROVIDER (Email/Password for simple auth)
    // ============================================================
    
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("User not found");
        }

        // Check password (you'll need to hash passwords on registration)
        // const isPasswordValid = await bcrypt.compare(
        //   credentials.password,
        //   user.hashedPassword || ""
        // );

        // if (!isPasswordValid) {
        //   throw new Error("Invalid password");
        // }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],

  // ============================================================
  // CALLBACKS
  // ============================================================
  
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Log sign-ins
      console.log(`User sign-in: ${user.email} via ${account?.provider}`);
      
      // You can add custom logic here:
      // - Check if user is allowed to sign in
      // - Verify email domain
      // - Update last login time
      
      if (user.email) {
        await prisma.user.update({
          where: { email: user.email },
          data: { lastLogin: new Date() },
        });
      }
      
      return true;
    },

    async redirect({ url, baseUrl }) {
      // Redirect to home page after sign in
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow callback URLs on same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },

    async session({ session, user }) {
      // Add custom properties to session
      if (session.user) {
        session.user.id = user.id;
        session.user.role = (user as any).role;
        session.user.subscriptionTier = (user as any).subscriptionTier;
      }
      return session;
    },

    async jwt({ token, user, account }) {
      // Add custom properties to JWT
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.subscriptionTier = (user as any).subscriptionTier;
      }
      return token;
    },
  },

  // ============================================================
  // SESSION & JWT CONFIGURATION
  // ============================================================
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update every 24 hours
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // ============================================================
  // PAGES
  // ============================================================
  
  pages: {
    signIn: "/auth/signin",
    // signOut: "/auth/signout",
    error: "/auth/error",
    // verifyRequest: "/auth/verify-request",
    // newUser: "/auth/new-user",
  },

  // ============================================================
  // EVENTS
  // ============================================================
  
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`Event: User ${user.email} signed in`, {
        isNew: isNewUser,
        provider: account?.provider,
      });
    },
    async signOut({ token }) {
      console.log(`Event: User signed out`);
    },
    async createUser({ user }) {
      console.log(`Event: New user created - ${user.email}`);
    },
  },

  // ============================================================
  // OTHER OPTIONS
  // ============================================================
  
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.DEBUG === "true",
};
