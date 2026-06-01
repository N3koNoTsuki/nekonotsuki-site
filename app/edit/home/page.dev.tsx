import HomeBlocksManager from "@/components/admin/HomeBlocksManager";
import { readBlocks } from "@/lib/content";
import type { BlockDTO } from "@/lib/types";

export default async function EditHomePage() {
  const blocks = (await readBlocks()).sort((a, b) => a.order - b.order);
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
