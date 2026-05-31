import { prisma } from "@/lib/prisma";
import TimelineManager from "@/components/admin/TimelineManager";
import type { TimelineDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminTimelinePage() {
  const entries = await prisma.timelineEntry.findMany({ orderBy: { order: "asc" } });
  const initial: TimelineDTO[] = entries.map((e) => ({
    id: e.id,
    date: e.date.toISOString(),
    title: e.title,
    description: e.description,
    tag: e.tag,
    order: e.order,
  }));

  return <TimelineManager initial={initial} />;
}
