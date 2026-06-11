import type { Metadata } from "next";
import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = { title: "Éditeur" };

// Local-only editor. No login: this whole route tree lives in *.dev.tsx files
// that the production static build ignores, so it never ships to the live site.
export default function EditLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-kawaii-radial bg-fixed dark:bg-kawaii-radial-dark">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:flex-row">
        {/* Sidebar */}
        <aside className="md:w-60 md:flex-shrink-0">
          <div className="glass sticky top-6 p-4">
            <div className="mb-4 flex items-center justify-between">
              <Link href="/edit" className="font-display text-lg font-bold text-rose-deep">
                🐾 Éditeur
              </Link>
              <ThemeToggle />
            </div>
            <AdminNav />
            <div className="mt-4 border-t border-white/40 pt-4 dark:border-white/10">
              <p className="mb-2 px-3 text-xs text-ink/50 dark:text-nightink/50">Mode édition local ✎</p>
              <Link href="/" className="btn-ghost mb-1 w-full justify-start text-sm">
                ↗ Voir le site
              </Link>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
