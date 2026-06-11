import Link from "next/link";
import NavLink from "./NavLink";
import { MoreMenu, MobileMenu } from "./NavMenus";
import ThemeToggle from "./ThemeToggle";
import OnekoToggle from "./OnekoToggle";
import { PRIMARY, MORE, ALL } from "@/lib/nav";

/**
 * Server-rendered navbar shell. Desktop primary links are plain anchors; the
 * "Plus" dropdown and the mobile menu are small client islands (MoreMenu /
 * MobileMenu) so they close automatically after a selection.
 */
export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-cream/70 backdrop-blur-md dark:border-white/10 dark:bg-night/70">
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

          {/* "Plus" dropdown — client island, closes after selection */}
          <MoreMenu items={MORE} />
        </ul>

        <div className="flex items-center gap-2">
          <OnekoToggle />
          <ThemeToggle />

          {/* Mobile menu — client island, closes after selection */}
          <MobileMenu items={ALL} />
        </div>
      </nav>
    </header>
  );
}
