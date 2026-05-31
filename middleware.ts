import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Edge-safe middleware: uses the providerless config so bcrypt/Prisma
// never get bundled for the Edge runtime.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Protect every /admin route. The `authorized` callback in auth.config.ts
  // decides access and redirects unauthenticated users to /login.
  matcher: ["/admin/:path*"],
};
