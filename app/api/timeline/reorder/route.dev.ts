import { NextRequest } from "next/server";
import { readTimeline, writeTimeline } from "@/lib/content";
import { badRequest, ok } from "@/lib/api";
import { reorderSchema } from "@/lib/validators";

export async function PUT(req: NextRequest) {
  const parsed = reorderSchema.safeParse(await req.json());
  if (!parsed.success) return badRequest("Données invalides", parsed.error.flatten());

  const entries = await readTimeline();
  const orderById = new Map(parsed.data.ids.map((id, i) => [id, i]));
  for (const e of entries) {
    const o = orderById.get(e.id);
    if (o !== undefined) e.order = o;
  }
  await writeTimeline(entries);
  return ok({ ok: true });
}
