import { NextRequest } from "next/server";
import { readAnime, writeAnime, newId, type MalPick } from "@/lib/content";
import { badRequest, ok } from "@/lib/api";
import { malPickSchema } from "@/lib/validators";

export async function GET() {
  const anime = await readAnime();
  const sorted = [...anime].sort((a, b) => a.order - b.order || b.createdAt.localeCompare(a.createdAt));
  return ok(sorted);
}

export async function POST(req: NextRequest) {
  const parsed = malPickSchema.safeParse(await req.json());
  if (!parsed.success) return badRequest("Données invalides", parsed.error.flatten());

  const anime = await readAnime();
  const maxOrder = anime.reduce((m, x) => Math.max(m, x.order), -1);
  const d = parsed.data;
  const entry: MalPick = {
    id: newId(),
    malId: d.malId ?? 0,
    title: d.title,
    imageUrl: d.imageUrl ?? null,
    url: d.url ?? "#",
    type: d.type ?? null,
    year: d.year ?? null,
    order: maxOrder + 1,
    createdAt: new Date().toISOString(),
  };
  anime.push(entry);
  await writeAnime(anime);
  return ok(entry, 201);
}
