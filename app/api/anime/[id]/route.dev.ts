import { NextRequest } from "next/server";
import { readAnime, writeAnime } from "@/lib/content";
import { ok, notFound } from "@/lib/api";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const anime = await readAnime();
  const next = anime.filter((m) => m.id !== params.id);
  if (next.length === anime.length) return notFound("Anime introuvable");
  await writeAnime(next);
  return ok({ ok: true });
}
