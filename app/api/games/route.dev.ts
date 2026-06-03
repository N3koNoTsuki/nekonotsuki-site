import { NextRequest } from "next/server";
import { readGames, writeGames, newId, type Game } from "@/lib/content";
import { badRequest, ok } from "@/lib/api";
import { rawgGameSchema } from "@/lib/validators";

export async function GET() {
  const games = await readGames();
  return ok([...games].sort((a, b) => a.order - b.order || b.createdAt.localeCompare(a.createdAt)));
}

export async function POST(req: NextRequest) {
  const parsed = rawgGameSchema.safeParse(await req.json());
  if (!parsed.success) return badRequest("Données invalides", parsed.error.flatten());

  const games = await readGames();
  if (games.some((g) => g.rawgId === parsed.data.rawgId)) return badRequest("Jeu déjà ajouté.");

  // New games go to the TOP of the list so they don't have to be dragged up.
  const minOrder = games.reduce((m, g) => Math.min(m, g.order), 0);
  const d = parsed.data;
  const game: Game = {
    id: newId(),
    source: "rawg",
    steamAppId: null,
    rawgId: d.rawgId,
    slug: d.slug ?? null,
    name: d.name,
    cover: d.cover ?? null,
    playtimeMinutes: null,
    released: d.released ?? null,
    platforms: d.platforms ?? null,
    highlight: false,
    rating: null,
    review: "",
    clips: [],
    visible: true,
    order: minOrder - 1,
    createdAt: new Date().toISOString(),
  };
  games.unshift(game);
  await writeGames(games);
  return ok(game, 201);
}
