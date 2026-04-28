import { NextFetchEvent, NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

const authMiddleware = withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname;
      if (path === "/admin/login") return true;
      if (path.startsWith("/admin")) {
        if (!token) return false;
        const role = (token as { role?: string }).role;
        return role === "admin";
      }
      return true;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
});

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  const path = req.nextUrl.pathname;

  if (path.startsWith("/user")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const url = new URL("/sign-in", req.url);
      url.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(url);
    }
    const role = (token as { role?: string }).role;
    if (role !== "customer" && role !== "admin") {
      const url = new URL("/sign-in", req.url);
      url.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (path.startsWith("/admin")) {
    return authMiddleware(req as never, event);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
