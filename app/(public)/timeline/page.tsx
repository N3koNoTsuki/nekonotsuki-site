import type { Metadata } from "next";
import { getTimeline } from "@/lib/data";
import { PageHeader, EmptyState } from "@/components/ui";
import TimelineView from "@/components/TimelineView";

export const metadata: Metadata = { title: "Parcours" };

export default async function TimelinePage() {
  const entries = await getTimeline();
  const view = entries.map((e) => ({
    id: e.id,
    date: e.date,
    endDate: e.endDate ?? null,
    title: e.title,
    description: e.description,
    tag: e.tag,
  }));

  return (
    <div>
      <PageHeader emoji="🌿" title="Mon parcours" subtitle="Études, expériences pro et projets perso" />

      {view.length === 0 ? (
        <EmptyState>Le parcours arrive bientôt ! ⏳</EmptyState>
      ) : (
        <TimelineView entries={view} />
      )}
    </div>
  );
}
