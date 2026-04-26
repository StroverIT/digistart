import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Demo credentials - in production, use environment variables
const ADMIN_EMAIL = "admin@sleekroute.bg";
const ADMIN_PASSWORD = "admin123";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Demo authentication - in production, check against database
        if (
          credentials?.email === ADMIN_EMAIL &&
          credentials?.password === ADMIN_PASSWORD
        ) {
          return {
            id: "1",
            name: "Администратор",
            email: ADMIN_EMAIL,
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/admin/вход",
  },
  callbacks: {
    authorized: async ({ auth, request }) => {
      const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
      const isLoginPage = request.nextUrl.pathname === "/admin/вход";

      if (isAdminRoute && !isLoginPage) {
        return !!auth;
      }

      return true;
    },
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
});
