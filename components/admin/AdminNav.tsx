"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Tableau de bord", icon: "🏠", exact: true },
  { href: "/admin/home", label: "Blocs accueil", icon: "🧩" },
  { href: "/admin/projects", label: "Projets", icon: "✨" },
  { href: "/admin/favorites", label: "Favoris", icon: "♡" },
  { href: "/admin/timeline", label: "Parcours", icon: "🌿" },
  { href: "/admin/about", label: "À propos", icon: "📝" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {ITEMS.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition",
              active
                ? "bg-rose-soft text-rose-deep dark:bg-white/10"
                : "text-ink/70 hover:bg-white/60 dark:text-[#efe6ee]/70 dark:hover:bg-white/10",
            )}
          >
            <span aria-hidden>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
