import Link from "next/link";
import NavLink from "./NavLink";
import ThemeToggle from "./ThemeToggle";
import OnekoToggle from "./OnekoToggle";

// Primary links stay inline on desktop; the rest fold into a "Plus" dropdown.
const PRIMARY = [
  { href: "/", label: "Accueil" },
  { href: "/projects", label: "Projets" },
  { href: "/favorites", label: "Favoris" },
  { href: "/collection", label: "Collection" },
  { href: "/about", label: "À propos" },
];
const MORE = [
  { href: "/competences", label: "Compétences" },
  { href: "/timeline", label: "Parcours" },
  { href: "/setup", label: "Setup" },
];
const ALL = [...PRIMARY, ...MORE];

/**
 * Server-rendered navbar. Navigation works fully without JavaScript: desktop
 * links are plain anchors, the "Plus" dropdown is a pure CSS hover/focus menu,
 * and the mobile menu uses a native <details> disclosure. The only client
 * islands are the active-route highlight (NavLink) and the toggles.
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
          {PRIMARY.map((l) => (
            <li key={l.href}>
              <NavLink href={l.href} label={l.label} />
            </li>
          ))}

          {/* "Plus" dropdown — pure CSS hover/focus, no JS */}
          <li className="group relative">
            <button
              type="button"
              aria-haspopup="menu"
              className="flex items-center gap-1 rounded-2xl px-3 py-2 text-sm font-semibold text-ink/70 transition hover:bg-white/60 hover:text-ink dark:text-[#efe6ee]/70 dark:hover:bg-white/10 dark:hover:text-[#efe6ee]"
            >
              Plus
              <span aria-hidden className="text-[0.6rem]">
                ▾
              </span>
            </button>
            <ul className="invisible absolute right-0 top-full z-50 flex w-44 flex-col gap-1 rounded-3xl border border-white/50 bg-cream/95 p-2 opacity-0 shadow-soft backdrop-blur-md transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 dark:border-white/10 dark:bg-[#2c2533]/95">
              {MORE.map((l) => (
                <li key={l.href}>
                  <NavLink href={l.href} label={l.label} block />
                </li>
              ))}
            </ul>
          </li>
        </ul>

        <div className="flex items-center gap-2">
          <OnekoToggle />
          <ThemeToggle />

          {/* Mobile menu — native <details>, no JS required */}
          <details className="group relative md:hidden">
            <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full bg-white/60 dark:bg-white/10 [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">☰</span>
              <span className="hidden group-open:inline">✕</span>
            </summary>
            <ul className="absolute right-0 mt-2 flex w-44 flex-col gap-1 rounded-3xl border border-white/50 bg-cream/95 p-2 shadow-soft backdrop-blur-md dark:border-white/10 dark:bg-[#2c2533]/95">
              {ALL.map((l) => (
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
