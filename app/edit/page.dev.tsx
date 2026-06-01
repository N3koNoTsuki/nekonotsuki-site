import Link from "next/link";
import { readBlocks, readProjects, readFavorites, readTimeline, readCategories } from "@/lib/content";

const CARDS = [
  { href: "/edit/home", label: "Blocs accueil", icon: "🧩", key: "blocks" },
  { href: "/edit/projects", label: "Projets", icon: "✨", key: "projects" },
  { href: "/edit/favorites", label: "Favoris", icon: "♡", key: "favorites" },
  { href: "/edit/timeline", label: "Étapes parcours", icon: "🌿", key: "timeline" },
] as const;

export default async function EditDashboard() {
  const [blocks, projects, favorites, timeline, categories] = await Promise.all([
    readBlocks(),
    readProjects(),
    readFavorites(),
    readTimeline(),
    readCategories(),
  ]);

  const counts: Record<string, number> = {
    blocks: blocks.length,
    projects: projects.length,
    favorites: favorites.length,
    timeline: timeline.length,
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold text-rose-deep">Tableau de bord ♡</h1>
        <p className="text-ink/60 dark:text-[#efe6ee]/60">Édite le contenu du site, puis enregistre et pousse sur GitHub.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c) => (
          <Link key={c.href} href={c.href} className="kawaii-card flex flex-col gap-1 p-5 transition hover:-translate-y-1">
            <span className="text-3xl" aria-hidden>
              {c.icon}
            </span>
            <span className="mt-2 text-3xl font-bold text-rose-deep">{counts[c.key]}</span>
            <span className="text-sm font-semibold text-ink/70 dark:text-[#efe6ee]/70">{c.label}</span>
          </Link>
        ))}
      </div>

      <div className="mt-6 glass p-6">
        <h2 className="mb-2 font-display text-xl font-bold text-lavender-deep">Pour commencer</h2>
        <ul className="prose-kawaii">
          <li>
            Organise la page d’accueil dans <Link href="/edit/home">Blocs accueil</Link> (réordonne par glisser-déposer).
          </li>
          <li>
            Ajoute tes <Link href="/edit/projects">projets</Link> avec image de couverture et tags.
          </li>
          <li>
            Range tes <Link href="/edit/favorites">favoris</Link> dans {categories.length} catégorie(s) — créables à volonté.
          </li>
          <li>
            Édite la page <Link href="/edit/about">À propos</Link> en Markdown avec aperçu en direct.
          </li>
        </ul>
        <p className="mt-4 text-sm text-ink/60 dark:text-[#efe6ee]/60">
          Tout est enregistré dans <code>content/*.json</code>. Quand tu as fini : <code>git add . &amp;&amp; git commit &amp;&amp; git push</code> — Vercel republie le site. ✨
        </p>
      </div>
    </div>
  );
}
