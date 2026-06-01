import TimelineManager from "@/components/admin/TimelineManager";
import { readTimeline } from "@/lib/content";
import type { TimelineDTO } from "@/lib/types";

export default async function EditTimelinePage() {
  const entries = (await readTimeline()).sort((a, b) => a.order - b.order);
  const initial: TimelineDTO[] = entries.map((e) => ({
    id: e.id,
    date: e.date,
    title: e.title,
    description: e.description,
    tag: e.tag,
    order: e.order,
  }));

  return <TimelineManager initial={initial} />;
}
