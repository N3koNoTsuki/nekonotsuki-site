import { NextRequest } from "next/server";
import { readPages, writePages, type Page } from "@/lib/content";
import { badRequest, ok } from "@/lib/api";
import { pageSchema } from "@/lib/validators";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const pages = await readPages();
  const page = pages.find((p) => p.slug === params.slug);
  return ok(page ?? { slug: params.slug, title: null, content: "" });
}

// Upsert: editing a page that doesn't exist yet just creates it.
export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  const parsed = pageSchema.safeParse(await req.json());
  if (!parsed.success) return badRequest("Données invalides", parsed.error.flatten());

  const pages = await readPages();
  const page: Page = { slug: params.slug, title: parsed.data.title ?? null, content: parsed.data.content };
  const idx = pages.findIndex((p) => p.slug === params.slug);
  if (idx === -1) pages.push(page);
  else pages[idx] = page;
  await writePages(pages);
  return ok(page);
}
