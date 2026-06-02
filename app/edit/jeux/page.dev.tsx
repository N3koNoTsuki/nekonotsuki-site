import GamesManager from "@/components/admin/GamesManager";
import { readGames } from "@/lib/content";
import type { GameDTO } from "@/lib/types";

export default async function EditGamesPage() {
  const games = await readGames();
  const initialGames: GameDTO[] = [...games]
    .sort((a, b) => a.order - b.order || b.createdAt.localeCompare(a.createdAt))
    .map((g) => ({
      id: g.id,
      source: g.source,
      steamAppId: g.steamAppId,
      rawgId: g.rawgId,
      slug: g.slug,
      name: g.name,
      cover: g.cover,
      playtimeMinutes: g.playtimeMinutes,
      released: g.released,
      platforms: g.platforms,
      highlight: g.highlight ?? false,
      rating: g.rating ?? null,
      review: g.review ?? "",
      clips: g.clips ?? [],
      visible: g.visible ?? true,
      order: g.order,
    }));

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold text-rose-deep">Jeux</h1>
        <p className="text-ink/60 dark:text-[#efe6ee]/60">
          Synchronise ta biblio Steam, ajoute tes jeux console (RAWG), puis pour chaque jeu : avis Markdown, clips et
          highlight.
        </p>
      </header>
      <GamesManager initialGames={initialGames} />
    </div>
  );
}
