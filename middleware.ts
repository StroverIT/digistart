import { withAuth } from "next-auth/middleware";

export default withAuth({
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

export const config = {
  matcher: ["/admin/:path*"],
};
