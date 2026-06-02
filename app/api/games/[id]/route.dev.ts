import { NextRequest } from "next/server";
import { readGames, writeGames } from "@/lib/content";
import { badRequest, ok, notFound } from "@/lib/api";
import { gameEditSchema } from "@/lib/validators";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const parsed = gameEditSchema.safeParse(await req.json());
  if (!parsed.success) return badRequest("Données invalides", parsed.error.flatten());

  const games = await readGames();
  const idx = games.findIndex((g) => g.id === params.id);
  if (idx === -1) return notFound("Jeu introuvable");

  const d = parsed.data;
  games[idx] = {
    ...games[idx],
    ...(d.highlight !== undefined ? { highlight: d.highlight } : {}),
    ...(d.rating !== undefined ? { rating: d.rating ?? null } : {}),
    ...(d.playtimeMinutes !== undefined ? { playtimeMinutes: d.playtimeMinutes ?? null } : {}),
    ...(d.review !== undefined ? { review: d.review } : {}),
    ...(d.clips !== undefined ? { clips: d.clips.map((c) => c.trim()).filter(Boolean) } : {}),
    ...(d.visible !== undefined ? { visible: d.visible } : {}),
  };
  await writeGames(games);
  return ok(games[idx]);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const games = await readGames();
  const next = games.filter((g) => g.id !== params.id);
  if (next.length === games.length) return notFound("Jeu introuvable");
  await writeGames(next);
  return ok({ ok: true });
}
