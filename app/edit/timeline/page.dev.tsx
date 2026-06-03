import TimelineManager from "@/components/admin/TimelineManager";
import { readTimeline } from "@/lib/content";
import type { TimelineDTO } from "@/lib/types";

export default async function EditTimelinePage() {
  // Most recent first — the timeline now sorts itself by date.
  const entries = (await readTimeline()).sort((a, b) => b.date.localeCompare(a.date));
  const initial: TimelineDTO[] = entries.map((e) => ({
    id: e.id,
    date: e.date,
    endDate: e.endDate ?? null,
    title: e.title,
    description: e.description,
    tag: e.tag,
    order: e.order,
  }));

  return <TimelineManager initial={initial} />;
}
