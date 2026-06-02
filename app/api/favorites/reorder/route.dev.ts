import { NextRequest } from "next/server";
import { readFavorites, writeFavorites } from "@/lib/content";
import { badRequest, ok } from "@/lib/api";
import { reorderSchema } from "@/lib/validators";

export async function PUT(req: NextRequest) {
  const parsed = reorderSchema.safeParse(await req.json());
  if (!parsed.success) return badRequest("Données invalides", parsed.error.flatten());

  const items = await readFavorites();
  const orderById = new Map(parsed.data.ids.map((id, i) => [id, i]));
  for (const item of items) {
    const o = orderById.get(item.id);
    if (o !== undefined) item.order = o;
  }
  await writeFavorites(items);
  return ok({ ok: true });
}
