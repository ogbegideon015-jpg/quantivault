import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/passwords";
import { z } from "zod";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; name: string; email: string;
      role: string; companyId: string;
      company: { name: string; plan: string; logo?: string };
    };
  }
  interface User {
    id: string; role: string; companyId: string;
    company: { name: string; plan: string; logo?: string };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string; role: string; companyId: string;
    company: { name: string; plan: string; logo?: string };
  }
}

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: { email: { type: "email" }, password: { type: "password" } },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const user = await prisma.user.findFirst({
          where: { email: { equals: email, mode: "insensitive" }, isActive: true },
          include: { company: { select: { id: true, name: true, subscriptionPlan: true, logo: true, isActive: true } } },
        });
        if (!user || !user.emailVerified || !user.company?.isActive || !user.passwordHash) return null;
        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) return null;
        await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
        return {
          id: user.id, name: user.name, email: user.email,
          role: user.role, companyId: user.companyId,
          company: { name: user.company.name, plan: user.company.subscriptionPlan, logo: user.company.logo || undefined },
        };
      },
    }),
    Google({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! }),
  ],
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/login", error: "/login?error=true", newUser: "/onboarding" },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const email = profile?.email;
        if (!email) return false;
        const existing = await prisma.user.findFirst({
          where: { email: { equals: email, mode: "insensitive" }, isActive: true },
          include: { company: true },
        });
        if (!existing || !existing.company?.isActive) return "/login?error=NoAccount";
        (user as any).id        = existing.id;
        (user as any).role      = existing.role;
        (user as any).companyId = existing.companyId;
        (user as any).company   = { name: existing.company.name, plan: existing.company.subscriptionPlan, logo: existing.company.logo };
        await prisma.user.update({ where: { id: existing.id }, data: { lastLoginAt: new Date(), emailVerified: true } });
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id        = user.id;
        token.role      = (user as any).role;
        token.companyId = (user as any).companyId;
        token.company   = (user as any).company;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id        = token.id;
        session.user.role      = token.role;
        session.user.companyId = token.companyId;
        session.user.company   = token.company;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/"))     return `${baseUrl}${url}`;
      return `${baseUrl}/dashboard`;
    },
  },
  debug: process.env.NODE_ENV === "development",
});
