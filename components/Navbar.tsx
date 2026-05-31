import Link from "next/link";
import NavLink from "./NavLink";
import ThemeToggle from "./ThemeToggle";

const LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/projects", label: "Projets" },
  { href: "/favorites", label: "Favoris" },
  { href: "/timeline", label: "Parcours" },
  { href: "/about", label: "À propos" },
];

/**
 * Server-rendered navbar. Navigation works fully without JavaScript:
 * desktop links are plain anchors and the mobile menu uses a native
 * <details> disclosure. The only client islands are the active-route
 * highlight (NavLink) and the theme toggle.
 */
export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-cream/70 backdrop-blur-md dark:border-white/10 dark:bg-[#241f29]/70">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold text-rose-deep">
          <span className="animate-float text-2xl" aria-hidden>
            🐾
          </span>
          NekoNoTsuki
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <NavLink href={l.href} label={l.label} />
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Mobile menu — native <details>, no JS required */}
          <details className="group relative md:hidden">
            <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full bg-white/60 dark:bg-white/10 [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">☰</span>
              <span className="hidden group-open:inline">✕</span>
            </summary>
            <ul className="absolute right-0 mt-2 flex w-44 flex-col gap-1 rounded-3xl border border-white/50 bg-cream/95 p-2 shadow-soft backdrop-blur-md dark:border-white/10 dark:bg-[#2c2533]/95">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <NavLink href={l.href} label={l.label} block />
                </li>
              ))}
            </ul>
          </details>
        </div>
      </nav>
    </header>
  );
}
