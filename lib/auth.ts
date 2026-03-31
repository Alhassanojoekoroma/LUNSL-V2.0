import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import AzureADProvider from "next-auth/providers/azure-ad";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Build development providers
const devProviders = process.env.NODE_ENV === 'development' ? [
  CredentialsProvider({
    name: "Demo Login",
    credentials: {
      email: { label: "Email", type: "email", placeholder: "test@example.com" },
    },
    async authorize(credentials, req) {
      console.log('[AUTH] Credentials provider authorize called with:', credentials);
      if (!credentials?.email) {
        throw new Error("Email is required");
      }

      try {
        const user = await prisma.user.upsert({
          where: { email: credentials.email },
          update: { lastLogin: new Date() },
          create: {
            email: credentials.email,
            name: credentials.email.split('@')[0],
            role: 'STUDENT',
            emailVerified: new Date(),
          },
        });

        console.log('[AUTH] Credentials provider authorizing user:', user.id, user.email);
        
        if (!user.email) {
          return null;
        }

        return {
          id: user.id,
          email: user.email as string,
          name: user.name,
          image: user.image,
        };
      } catch (error) {
        console.error("Dev auth error:", error);
        throw error;
      }
    },
  }),
] : [];

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
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
      maxAge: 24 * 60 * 60,
    }),

    // Add dev providers
    ...devProviders,
  ],

  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      try {
        console.log(`[AUTH] User sign-in attempt: ${user.email} via ${account?.provider || 'credentials'}`);

        if (user.email) {
          await prisma.user.update({
            where: { email: user.email },
            data: { lastLogin: new Date() },
          }).catch((err) => {
            console.error("Failed to update last login:", err);
          });
        }

        return true;
      } catch (error) {
        console.error("Sign-in callback error:", error);
        return false;
      }
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl + "/dashboard";
    },

    async session({ session, user }) {
      console.log('[AUTH] Session callback - user from DB:', user?.id, user?.email);
      // With database sessions, user object is populated from the database
      if (session.user && user) {
        session.user.id = user.id;
        (session.user as any).role = (user as any).role;
        (session.user as any).subscriptionTier = (user as any).subscriptionTier;
        console.log('[AUTH] Session callback - returning session with user:', session.user.id);
      } else {
        console.log('[AUTH] Session callback - NO USER FOUND. session.user:', session.user, 'user param:', user);
      }
      return session;
    },
  },

  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug logging in development
};

