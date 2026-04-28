import type { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { clearPostCheckoutTokenInDb } from "@/lib/server/orders";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@digistart.bg";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

type AppUser = NextAuthUser & { role?: string };

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "admin",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          credentials?.email === ADMIN_EMAIL &&
          credentials?.password === ADMIN_PASSWORD
        ) {
          return {
            id: "admin-env",
            name: "Администратор",
            email: ADMIN_EMAIL,
            role: "admin",
          } satisfies AppUser;
        }
        return null;
      },
    }),
    CredentialsProvider({
      id: "customer",
      name: "Customer",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role === "admin" ? "admin" : "customer",
        } satisfies AppUser;
      },
    }),
    CredentialsProvider({
      id: "post-checkout",
      name: "Post checkout",
      credentials: {
        orderId: { label: "Order ID", type: "text" },
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        const orderId = credentials?.orderId?.trim();
        const token = credentials?.token?.trim();
        if (!orderId || !token) return null;

        const order = await prisma.order.findUnique({
          where: { id: orderId },
          select: {
            postCheckoutToken: true,
            userId: true,
          },
        });
        if (
          !order?.postCheckoutToken ||
          order.postCheckoutToken !== token ||
          !order.userId
        ) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { id: order.userId },
        });
        if (!user) return null;

        await clearPostCheckoutTokenInDb(orderId);

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: "customer",
        } satisfies AppUser;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as AppUser).role ?? "customer";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "customer";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
