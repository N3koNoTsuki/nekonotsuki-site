import Link from "next/link";
import { FOOTER_GROUPS, SOCIALS } from "@/lib/nav";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-white/40 bg-cream/60 backdrop-blur-sm dark:border-white/10 dark:bg-night/60">
      <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-10 sm:grid-cols-3">
        {FOOTER_GROUPS.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="mb-3 font-display text-sm font-bold text-lavender-deep">{group.title}</h2>
            <ul className="space-y-1.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-ink/60 transition hover:text-rose-deep dark:text-nightink/60 dark:hover:text-rose"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <nav aria-label="Me suivre">
          <h2 className="mb-3 font-display text-sm font-bold text-lavender-deep">🌐 Me suivre</h2>
          <ul className="space-y-1.5">
            {SOCIALS.map((social) => (
              <li key={social.href}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-ink/60 transition hover:text-rose-deep dark:text-nightink/60 dark:hover:text-rose"
                >
                  <span className="mr-1" aria-hidden>
                    {social.emoji}
                  </span>
                  {social.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <p className="flex items-center justify-center gap-1.5 border-t border-white/40 py-5 text-center text-sm text-ink/60 dark:border-white/10 dark:text-nightink/60">
        <span aria-hidden>🌸</span>
        Fait avec amour — NekoNoTsuki © {year}
        <span aria-hidden>🌸</span>
      </p>
    </footer>
  );
}
