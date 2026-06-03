import { NextRequest } from "next/server";
import { readFeaturedMusic, writeFeaturedMusic } from "@/lib/content";
import { badRequest, ok } from "@/lib/api";
import { reorderSchema } from "@/lib/validators";

export async function PUT(req: NextRequest) {
  const parsed = reorderSchema.safeParse(await req.json());
  if (!parsed.success) return badRequest("Données invalides", parsed.error.flatten());

  const tracks = await readFeaturedMusic();
  const orderById = new Map(parsed.data.ids.map((id, i) => [id, i]));
  for (const t of tracks) {
    const o = orderById.get(t.id);
    if (o !== undefined) t.order = o;
  }
  await writeFeaturedMusic(tracks);
  return ok({ ok: true });
}
