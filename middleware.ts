import { NextFetchEvent, NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";
import {
  isComingSoonEnabled,
  isComingSoonAllowedApiPath,
} from "@/lib/coming-soon";

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
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", path);

  if (isComingSoonEnabled() && path.startsWith("/api") && !isComingSoonAllowedApiPath(path)) {
    return NextResponse.json(
      { error: "Услугата е временно недостъпна." },
      { status: 503 },
    );
  }

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
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (path.startsWith("/admin")) {
    const adminResult = await authMiddleware(req as never, event);
    if (!adminResult) {
      return NextResponse.next({ request: { headers: requestHeaders } });
    }
    if (adminResult.status >= 300 && adminResult.status < 400) {
      return adminResult;
    }
    const next = NextResponse.next({ request: { headers: requestHeaders } });
    adminResult.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        next.headers.append(key, value);
      }
    });
    return next;
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/:path*"],
};
