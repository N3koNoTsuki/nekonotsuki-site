import { NextRequest } from "next/server";
import { readMusic, writeMusic } from "@/lib/content";
import { ok, notFound } from "@/lib/api";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = (await req.json().catch(() => ({}))) as { visible?: unknown };
  const music = await readMusic();
  const idx = music.findIndex((m) => m.id === params.id);
  if (idx === -1) return notFound("Playlist introuvable");
  if (typeof body.visible === "boolean") {
    music[idx] = { ...music[idx], visible: body.visible };
  }
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
