import type { Metadata } from "next";
import { getTimeline } from "@/lib/data";
import { TimelineItem } from "@/components/cards";
import { PageHeader, EmptyState } from "@/components/ui";

export const metadata: Metadata = { title: "Parcours" };

export default async function TimelinePage() {
  const entries = await getTimeline();

  return (
    <div>
      <PageHeader emoji="🌿" title="Mon parcours" subtitle="Études, expériences pro et projets perso" />

      {entries.length === 0 ? (
        <EmptyState>Le parcours arrive bientôt ! ⏳</EmptyState>
      ) : (
        <ul className="mx-auto max-w-2xl space-y-6">
          {entries.map((entry, i) => (
            <TimelineItem key={entry.id} entry={entry} last={i === entries.length - 1} animate delay={i * 50} />
          ))}
        </ul>
      )}
    </div>
  );
}
