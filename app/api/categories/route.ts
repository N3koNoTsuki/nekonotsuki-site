import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, badRequest, ok } from "@/lib/api";
import { categorySchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { items: true } } },
  });
  return ok(categories);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const parsed = categorySchema.safeParse(await req.json());
  if (!parsed.success) return badRequest("Données invalides", parsed.error.flatten());

  const baseSlug = slugify(parsed.data.slug || parsed.data.name);
  // Ensure slug uniqueness
  let slug = baseSlug;
  let n = 1;
  while (await prisma.category.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${n++}`;
  }

  const max = await prisma.category.aggregate({ _max: { order: true } });
  const category = await prisma.category.create({
    data: {
      name: parsed.data.name,
      icon: parsed.data.icon,
      slug,
      order: (max._max.order ?? -1) + 1,
    },
  });
  return ok(category, 201);
}
