import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, badRequest, ok } from "@/lib/api";
import { timelineSchema } from "@/lib/validators";

export async function GET() {
  const entries = await prisma.timelineEntry.findMany({
    orderBy: [{ order: "asc" }, { date: "desc" }],
  });
  return ok(entries);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const parsed = timelineSchema.safeParse(await req.json());
  if (!parsed.success) return badRequest("Données invalides", parsed.error.flatten());

  const max = await prisma.timelineEntry.aggregate({ _max: { order: true } });
  const entry = await prisma.timelineEntry.create({
    data: { ...parsed.data, order: (max._max.order ?? -1) + 1 },
  });
  return ok(entry, 201);
}
