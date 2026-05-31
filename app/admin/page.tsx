import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CARDS = [
  { href: "/admin/home", label: "Blocs accueil", icon: "🧩", key: "blocks" },
  { href: "/admin/projects", label: "Projets", icon: "✨", key: "projects" },
  { href: "/admin/favorites", label: "Favoris", icon: "♡", key: "favorites" },
  { href: "/admin/timeline", label: "Étapes parcours", icon: "🌿", key: "timeline" },
] as const;

export default async function AdminDashboard() {
  const [blocks, projects, favorites, timeline, categories] = await Promise.all([
    prisma.homeBlock.count(),
    prisma.project.count(),
    prisma.favorite.count(),
    prisma.timelineEntry.count(),
    prisma.category.count(),
  ]);

  const counts: Record<string, number> = { blocks, projects, favorites, timeline };

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold text-rose-deep">Tableau de bord ♡</h1>
        <p className="text-ink/60 dark:text-[#efe6ee]/60">Gère tout le contenu de ton site sans toucher au code.</p>
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
            Organise la page d’accueil dans <Link href="/admin/home">Blocs accueil</Link> (réordonne par glisser-déposer).
          </li>
          <li>
            Ajoute tes <Link href="/admin/projects">projets</Link> avec image de couverture et tags.
          </li>
          <li>
            Range tes <Link href="/admin/favorites">favoris</Link> dans {categories} catégorie(s) — créables à volonté.
          </li>
          <li>
            Édite la page <Link href="/admin/about">À propos</Link> en Markdown avec aperçu en direct.
          </li>
        </ul>
      </div>
    </div>
  );
}
