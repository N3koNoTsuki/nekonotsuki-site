import { NextRequest } from "next/server";
import { readFeaturedMusic, writeFeaturedMusic } from "@/lib/content";
import { badRequest, ok, notFound } from "@/lib/api";
import { featuredTrackSchema } from "@/lib/validators";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const parsed = featuredTrackSchema.partial().safeParse(await req.json());
  if (!parsed.success) return badRequest("Données invalides", parsed.error.flatten());

  const tracks = await readFeaturedMusic();
  const idx = tracks.findIndex((t) => t.id === params.id);
  if (idx === -1) return notFound("Titre introuvable");

  const d = parsed.data;
  tracks[idx] = {
    ...tracks[idx],
    ...(d.title !== undefined ? { title: d.title } : {}),
    ...(d.comment !== undefined ? { comment: d.comment ?? "" } : {}),
  };
  await writeFeaturedMusic(tracks);
  return ok(tracks[idx]);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const tracks = await readFeaturedMusic();
  const next = tracks.filter((t) => t.id !== params.id);
  if (next.length === tracks.length) return notFound("Titre introuvable");
  await writeFeaturedMusic(next);
  return ok({ ok: true });
}
