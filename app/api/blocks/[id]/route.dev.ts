import { NextRequest } from "next/server";
import { readBlocks, writeBlocks } from "@/lib/content";
import { badRequest, ok, notFound } from "@/lib/api";
import { blockSchema } from "@/lib/validators";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const parsed = blockSchema.partial().safeParse(await req.json());
  if (!parsed.success) return badRequest("Données invalides", parsed.error.flatten());

  const blocks = await readBlocks();
  const idx = blocks.findIndex((b) => b.id === params.id);
  if (idx === -1) return notFound("Bloc introuvable");

  const d = parsed.data;
  blocks[idx] = {
    ...blocks[idx],
    ...(d.type !== undefined ? { type: d.type } : {}),
    ...(d.title !== undefined ? { title: d.title ?? null } : {}),
    ...(d.content !== undefined ? { content: d.content ?? null } : {}),
    ...(d.config !== undefined ? { config: d.config ?? null } : {}),
    ...(d.visible !== undefined ? { visible: d.visible } : {}),
  };
  await writeBlocks(blocks);
  return ok(blocks[idx]);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const blocks = await readBlocks();
  const next = blocks.filter((b) => b.id !== params.id);
  if (next.length === blocks.length) return notFound("Bloc introuvable");
  await writeBlocks(next);
  return ok({ ok: true });
}
