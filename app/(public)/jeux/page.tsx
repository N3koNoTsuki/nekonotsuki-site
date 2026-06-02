import type { Metadata } from "next";
import { getGames } from "@/lib/data";
import { PageHeader, EmptyState } from "@/components/ui";
import GamesShowcase from "@/components/GamesShowcase";

export const metadata: Metadata = { title: "Jeux" };

// Static page: the games come from content/games.json (refreshed via the local
// Steam sync + git push), so there is nothing to revalidate at runtime.
export default async function JeuxPage() {
  const games = (await getGames()).filter((g) => g.visible);

  return (
    <div>
      <PageHeader emoji="🎮" title="Mes jeux" subtitle="Ma bibliothèque Steam et mes coups de cœur" />

      {games.length === 0 ? (
        <EmptyState>Mes jeux arrivent vite. 🎮</EmptyState>
      ) : (
        <GamesShowcase games={games} />
      )}
    </div>
  );
}
