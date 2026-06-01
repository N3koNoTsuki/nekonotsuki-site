import { NextRequest } from "next/server";
import { readTimeline, writeTimeline } from "@/lib/content";
import { badRequest, ok, notFound } from "@/lib/api";
import { timelineSchema } from "@/lib/validators";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const parsed = timelineSchema.partial().safeParse(await req.json());
  if (!parsed.success) return badRequest("Données invalides", parsed.error.flatten());

  const entries = await readTimeline();
  const idx = entries.findIndex((e) => e.id === params.id);
  if (idx === -1) return notFound("Entrée introuvable");

  const d = parsed.data;
  entries[idx] = {
    ...entries[idx],
    ...(d.title !== undefined ? { title: d.title } : {}),
    ...(d.date !== undefined ? { date: d.date.toISOString().slice(0, 10) } : {}),
    ...(d.description !== undefined ? { description: d.description ?? null } : {}),
    ...(d.tag !== undefined ? { tag: d.tag } : {}),
  };
  await writeTimeline(entries);
  return ok(entries[idx]);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const entries = await readTimeline();
  const next = entries.filter((e) => e.id !== params.id);
  if (next.length === entries.length) return notFound("Entrée introuvable");
  await writeTimeline(next);
  return ok({ ok: true });
}
