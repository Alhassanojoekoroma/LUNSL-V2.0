import { DefaultSession } from "next-auth";
import { UserRole, SubscriptionTier } from "@prisma/client";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
      role?: UserRole;
      subscriptionTier?: SubscriptionTier;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    role?: UserRole;
    subscriptionTier?: SubscriptionTier;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
    subscriptionTier?: string;
  }
}
