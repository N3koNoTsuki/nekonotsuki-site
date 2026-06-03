import { NextRequest } from "next/server";
import { readMusic, writeMusic } from "@/lib/content";
import { badRequest, ok, notFound } from "@/lib/api";
import { musicEditSchema } from "@/lib/validators";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const parsed = musicEditSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return badRequest("Données invalides", parsed.error.flatten());

  const music = await readMusic();
  const idx = music.findIndex((m) => m.id === params.id);
  if (idx === -1) return notFound("Playlist introuvable");

  const d = parsed.data;
  music[idx] = {
    ...music[idx],
    ...(d.visible !== undefined ? { visible: d.visible } : {}),
    ...(d.comment !== undefined ? { comment: d.comment ?? "" } : {}),
  };
  await writeMusic(music);
  return ok(music[idx]);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const music = await readMusic();
  const next = music.filter((m) => m.id !== params.id);
  if (next.length === music.length) return notFound("Playlist introuvable");
  await writeMusic(next);
  return ok({ ok: true });
}
