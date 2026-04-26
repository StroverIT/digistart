import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withAuth } from "next-auth/middleware";

const authMiddleware = withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname;
      if (path === "/admin/вход") return true;
      if (path.startsWith("/admin")) return !!token;
      return true;
    },
  },
  pages: {
    signIn: "/admin/вход",
  },
});

const routeRewriteMap: Record<string, string> = {
  "/услуги/уебсайт": "/services/website",
  "/услуги/онлайн-магазин": "/services/online-store",
  "/услуги/google-business": "/services/google-business",
  "/услуги/социални-мрежи": "/services/social-media",
};

export default function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const decodedPathname = decodeURI(pathname);
  const rewriteDestination = routeRewriteMap[decodedPathname] ?? routeRewriteMap[pathname];

  if (rewriteDestination) {
    const url = req.nextUrl.clone();
    url.pathname = rewriteDestination;
    return NextResponse.rewrite(url);
  }

  if (req.nextUrl.pathname.startsWith("/admin")) {
    return authMiddleware(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
