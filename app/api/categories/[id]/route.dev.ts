import { NextRequest } from "next/server";
import { readCategories, writeCategories, readFavorites, writeFavorites } from "@/lib/content";
import { badRequest, ok, notFound } from "@/lib/api";
import { categorySchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const parsed = categorySchema.partial().safeParse(await req.json());
  if (!parsed.success) return badRequest("Données invalides", parsed.error.flatten());

  const categories = await readCategories();
  const idx = categories.findIndex((c) => c.id === params.id);
  if (idx === -1) return notFound("Catégorie introuvable");

  const d = parsed.data;
  let slug = categories[idx].slug;
  if (d.slug) {
    const base = slugify(d.slug);
    const taken = new Set(categories.filter((c) => c.id !== params.id).map((c) => c.slug));
    slug = base;
    let n = 1;
    while (taken.has(slug)) slug = `${base}-${n++}`;
  }

  categories[idx] = {
    ...categories[idx],
    ...(d.name !== undefined ? { name: d.name } : {}),
    ...(d.icon !== undefined ? { icon: d.icon ?? null } : {}),
    slug,
  };
  await writeCategories(categories);
  return ok(categories[idx]);
}

// Cascade: deleting a category removes its favorites too.
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const categories = await readCategories();
  const next = categories.filter((c) => c.id !== params.id);
  if (next.length === categories.length) return notFound("Catégorie introuvable");
  await writeCategories(next);

  const favorites = await readFavorites();
  await writeFavorites(favorites.filter((f) => f.categoryId !== params.id));
  return ok({ ok: true });
}
