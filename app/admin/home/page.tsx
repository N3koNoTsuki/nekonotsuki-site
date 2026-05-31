import { prisma } from "@/lib/prisma";
import HomeBlocksManager from "@/components/admin/HomeBlocksManager";
import type { BlockDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const blocks = await prisma.homeBlock.findMany({ orderBy: { order: "asc" } });
  const initial: BlockDTO[] = blocks.map((b) => ({
    id: b.id,
    type: b.type,
    title: b.title,
    content: b.content,
    config: b.config,
    visible: b.visible,
    order: b.order,
  }));

  return <HomeBlocksManager initial={initial} />;
}
