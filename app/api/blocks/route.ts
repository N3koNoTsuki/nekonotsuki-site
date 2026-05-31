import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, badRequest, ok } from "@/lib/api";
import { blockSchema } from "@/lib/validators";

export async function GET() {
  const blocks = await prisma.homeBlock.findMany({ orderBy: { order: "asc" } });
  return ok(blocks);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const parsed = blockSchema.safeParse(await req.json());
  if (!parsed.success) return badRequest("Données invalides", parsed.error.flatten());

  const max = await prisma.homeBlock.aggregate({ _max: { order: true } });
  const block = await prisma.homeBlock.create({
    data: { ...parsed.data, order: (max._max.order ?? -1) + 1 },
  });
  return ok(block, 201);
}
