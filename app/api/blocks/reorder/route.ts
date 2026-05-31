import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, badRequest, ok } from "@/lib/api";
import { reorderSchema } from "@/lib/validators";

export async function PUT(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const parsed = reorderSchema.safeParse(await req.json());
  if (!parsed.success) return badRequest("Données invalides", parsed.error.flatten());

  await prisma.$transaction(
    parsed.data.ids.map((id, index) =>
      prisma.homeBlock.update({ where: { id }, data: { order: index } }),
    ),
  );
  return ok({ ok: true });
}
