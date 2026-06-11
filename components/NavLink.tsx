"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * A normal anchor (works without JS — SSR renders the <a>); JS only layers on
 * the active-route highlight.
 */
export default function NavLink({
  href,
  label,
  block = false,
  onClick,
}: {
  href: string;
  label: string;
  block?: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "rounded-2xl px-3 py-2 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-rose-deep/60",
        block && "block",
        active
          ? "bg-rose-soft text-rose-deep dark:bg-white/10"
          : "text-ink/70 hover:bg-white/60 hover:text-ink dark:text-nightink/70 dark:hover:bg-white/10 dark:hover:text-nightink",
      )}
    >
      {label}
    </Link>
  );
}
