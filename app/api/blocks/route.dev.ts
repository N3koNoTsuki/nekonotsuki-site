import { NextRequest } from "next/server";
import { readBlocks, writeBlocks, newId, type Block } from "@/lib/content";
import { badRequest, ok } from "@/lib/api";
import { blockSchema } from "@/lib/validators";

export async function GET() {
  const blocks = (await readBlocks()).sort((a, b) => a.order - b.order);
  return ok(blocks);
}

export async function POST(req: NextRequest) {
  const parsed = blockSchema.safeParse(await req.json());
  if (!parsed.success) return badRequest("Données invalides", parsed.error.flatten());

  const blocks = await readBlocks();
  const maxOrder = blocks.reduce((m, b) => Math.max(m, b.order), -1);
  const block: Block = {
    id: newId(),
    type: parsed.data.type,
    title: parsed.data.title ?? null,
    content: parsed.data.content ?? null,
    config: parsed.data.config ?? null,
    order: maxOrder + 1,
    visible: parsed.data.visible ?? true,
    createdAt: new Date().toISOString(),
  };
  blocks.push(block);
  await writeBlocks(blocks);
  return ok(block, 201);
}
