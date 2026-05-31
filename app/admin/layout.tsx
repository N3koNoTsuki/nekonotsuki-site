import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminNav from "@/components/admin/AdminNav";
import SignOutButton from "@/components/admin/SignOutButton";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Middleware already gates /admin/*, but guard here too (defense in depth)
  // and to access the session for the greeting.
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-kawaii-radial bg-fixed dark:bg-kawaii-radial-dark">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:flex-row">
        {/* Sidebar */}
        <aside className="md:w-60 md:flex-shrink-0">
          <div className="glass sticky top-6 p-4">
            <div className="mb-4 flex items-center justify-between">
              <Link href="/admin" className="font-display text-lg font-bold text-rose-deep">
                🐾 Admin
              </Link>
              <ThemeToggle />
            </div>
            <AdminNav />
            <div className="mt-4 border-t border-white/40 pt-4 dark:border-white/10">
              <p className="mb-2 px-3 text-xs text-ink/50 dark:text-[#efe6ee]/50">
                {session.user.name ?? session.user.email}
              </p>
              <Link href="/" className="btn-ghost mb-1 w-full justify-start text-sm">
                ↗ Voir le site
              </Link>
              <SignOutButton />
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
