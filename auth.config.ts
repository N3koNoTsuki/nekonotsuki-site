import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe NextAuth config (no DB / bcrypt imports here).
 * Imported by middleware.ts so the Edge runtime stays lean.
 * The Credentials provider with its bcrypt-backed `authorize`
 * lives in auth.ts (Node runtime only).
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [], // real providers are injected in auth.ts
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      if (isOnAdmin) {
        // Returning false makes NextAuth redirect to the signIn page.
        return isLoggedIn;
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
