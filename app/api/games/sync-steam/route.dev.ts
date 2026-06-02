import { NextRequest } from "next/server";
import { readGames, writeGames, newId, type Game } from "@/lib/content";
import { badRequest, ok } from "@/lib/api";
import { fetchOwnedGames } from "@/lib/steam";

export async function POST(_req: NextRequest) {
  const key = process.env.STEAM_API_KEY;
  const steamId = process.env.STEAM_ID;
  if (!key || !steamId) return badRequest("STEAM_API_KEY / STEAM_ID manquants dans .env.local.");

  try {
    const owned = await fetchOwnedGames(key, steamId);
    const games = await readGames();
    const bySteam = new Map(games.filter((g) => g.steamAppId != null).map((g) => [g.steamAppId, g]));
    const nonSteam = games.filter((g) => g.source !== "steam"); // keep manually-added RAWG games

    // Only games actually played, most-played first.
    const played = owned.filter((g) => g.playtimeMinutes > 0).sort((a, b) => b.playtimeMinutes - a.playtimeMinutes);

    const steamGames: Game[] = played.map((g) => {
      const prev = bySteam.get(g.appId);
      return {
        id: prev?.id ?? newId(),
        source: "steam",
        steamAppId: g.appId,
        rawgId: null,
        slug: null,
        name: g.name,
        cover: g.cover,
        playtimeMinutes: g.playtimeMinutes,
        released: null,
        platforms: "PC (Steam)",
        highlight: prev?.highlight ?? false,
        rating: prev?.rating ?? null,
        review: prev?.review ?? "",
        clips: prev?.clips ?? [],
        visible: prev?.visible ?? true,
        order: 0,
        createdAt: prev?.createdAt ?? new Date().toISOString(),
      };
    });

    const result = [...steamGames, ...nonSteam];
    result.forEach((g, i) => {
      g.order = i;
    });
    await writeGames(result);
    return ok({ count: steamGames.length, total: result.length });
  } catch (e) {
    return badRequest(e instanceof Error ? e.message : "Erreur Steam.");
  }
}
