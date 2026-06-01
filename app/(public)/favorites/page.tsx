import type { Metadata } from "next";
import { getCategoriesWithFavorites } from "@/lib/data";
import { FavoriteCard } from "@/components/cards";
import { PageHeader, EmptyState } from "@/components/ui";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = { title: "Favoris" };

export default async function FavoritesPage() {
  const categories = await getCategoriesWithFavorites();
  const withItems = categories.filter((c) => c.items.length > 0);

  return (
    <div>
      <PageHeader emoji="♡" title="Mes favoris" subtitle="Mes coups de cœur, classés par catégorie" />

      {/* Anchor nav between categories (works without JS) */}
      {withItems.length > 1 && (
        <nav className="mb-8 flex flex-wrap justify-center gap-2">
          {withItems.map((c) => (
            <a key={c.id} href={`#${c.slug}`} className="chip bg-lavender-soft text-lavender-deep hover:bg-lavender">
              {c.icon} {c.name}
            </a>
          ))}
        </nav>
      )}

      {withItems.length === 0 ? (
        <EmptyState>Aucun favori pour l’instant. Reviens vite ! 🌷</EmptyState>
      ) : (
        <div className="space-y-12">
          {withItems.map((category, ci) => (
            <Reveal key={category.id} delay={ci * 60} as="section">
              <h2 id={category.slug} className="mb-4 scroll-mt-24 font-display text-2xl font-bold text-rose-deep">
                <span className="mr-1" aria-hidden>
                  {category.icon}
                </span>
                {category.name}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {category.items.map((item) => (
                  <FavoriteCard key={item.id} favorite={item} />
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
