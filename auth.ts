import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ account, user }) {
      if (account?.provider !== "google" || !user.email || !account.providerAccountId) {
        return false;
      }

      const fallbackName = user.name?.trim() || user.email.split("@")[0];

      const existingUser = await prisma.user.findUnique({ where: { email: user.email } });
      
      let referredBy = undefined;
      if (!existingUser) {
        const cookieStore = await cookies();
        const refCode = cookieStore.get("battleplay_ref")?.value;
        if (refCode) {
          const referrer = await prisma.user.findUnique({ where: { referralCode: refCode } });
          if (referrer) referredBy = referrer.id;
        }
      }

      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          googleId: account.providerAccountId,
          name: fallbackName,
        },
        create: {
          email: user.email,
          googleId: account.providerAccountId,
          name: fallbackName,
          referredBy: referredBy,
        },
      });

      return true;
    },
    async jwt({ token, account }) {
      if (account?.provider === "google" && token.email) {
        const user = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true },
        });

        if (user) {
          token.id = user.id;
          token.role = user.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id && token.role) {
        session.user.id = token.id;
        session.user.role = token.role;
      }

      return session;
    },
  },
};
