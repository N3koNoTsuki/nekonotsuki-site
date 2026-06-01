import { NextRequest } from "next/server";
import { readBlocks, writeBlocks } from "@/lib/content";
import { badRequest, ok } from "@/lib/api";
import { reorderSchema } from "@/lib/validators";

export async function PUT(req: NextRequest) {
  const parsed = reorderSchema.safeParse(await req.json());
  if (!parsed.success) return badRequest("Données invalides", parsed.error.flatten());

  const blocks = await readBlocks();
  const orderById = new Map(parsed.data.ids.map((id, i) => [id, i]));
  for (const b of blocks) {
    const o = orderById.get(b.id);
    if (o !== undefined) b.order = o;
  }
  await writeBlocks(blocks);
  return ok({ ok: true });
}
