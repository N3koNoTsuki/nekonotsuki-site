import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, badRequest, ok } from "@/lib/api";
import { pageSchema } from "@/lib/validators";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const page = await prisma.page.findUnique({ where: { slug: params.slug } });
  return ok(page ?? { slug: params.slug, title: null, content: "" });
}

// Upsert: editing a page that doesn't exist yet just creates it.
export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  const { error } = await requireAuth();
  if (error) return error;

  const parsed = pageSchema.safeParse(await req.json());
  if (!parsed.success) return badRequest("Données invalides", parsed.error.flatten());

  const page = await prisma.page.upsert({
    where: { slug: params.slug },
    update: { title: parsed.data.title, content: parsed.data.content },
    create: { slug: params.slug, title: parsed.data.title, content: parsed.data.content },
  });
  return ok(page);
}
