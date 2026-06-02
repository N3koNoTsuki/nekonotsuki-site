import { NextRequest } from "next/server";
import { readManga, writeManga } from "@/lib/content";
import { ok, notFound } from "@/lib/api";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const manga = await readManga();
  const next = manga.filter((m) => m.id !== params.id);
  if (next.length === manga.length) return notFound("Manga introuvable");
  await writeManga(next);
  return ok({ ok: true });
}
