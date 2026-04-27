import { NextFetchEvent, NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withAuth } from "next-auth/middleware";

const authMiddleware = withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname;
      if (path === "/admin/login") return true;
      if (path.startsWith("/admin")) return !!token;
      return true;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
});

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    return authMiddleware(req as any, event);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
