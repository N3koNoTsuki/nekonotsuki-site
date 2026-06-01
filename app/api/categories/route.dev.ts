import { NextRequest } from "next/server";
import { readCategories, writeCategories, newId, type Category } from "@/lib/content";
import { badRequest, ok } from "@/lib/api";
import { categorySchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";

export async function GET() {
  const categories = (await readCategories()).sort((a, b) => a.order - b.order);
  return ok(categories);
}

export async function POST(req: NextRequest) {
  const parsed = categorySchema.safeParse(await req.json());
  if (!parsed.success) return badRequest("Données invalides", parsed.error.flatten());

  const categories = await readCategories();
  const base = slugify(parsed.data.slug || parsed.data.name);
  const taken = new Set(categories.map((c) => c.slug));
  let slug = base;
  let n = 1;
  while (taken.has(slug)) slug = `${base}-${n++}`;

  const maxOrder = categories.reduce((m, c) => Math.max(m, c.order), -1);
  const category: Category = {
    id: newId(),
    name: parsed.data.name,
    slug,
    icon: parsed.data.icon ?? null,
    order: maxOrder + 1,
    createdAt: new Date().toISOString(),
  };
  categories.push(category);
  await writeCategories(categories);
  return ok(category, 201);
}
