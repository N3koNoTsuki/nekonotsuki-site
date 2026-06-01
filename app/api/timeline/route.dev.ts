import { NextRequest } from "next/server";
import { readTimeline, writeTimeline, newId, type TimelineEntry } from "@/lib/content";
import { badRequest, ok } from "@/lib/api";
import { timelineSchema } from "@/lib/validators";

export async function GET() {
  const entries = (await readTimeline()).sort(
    (a, b) => a.order - b.order || b.date.localeCompare(a.date),
  );
  return ok(entries);
}

export async function POST(req: NextRequest) {
  const parsed = timelineSchema.safeParse(await req.json());
  if (!parsed.success) return badRequest("Données invalides", parsed.error.flatten());

  const entries = await readTimeline();
  const maxOrder = entries.reduce((m, e) => Math.max(m, e.order), -1);
  const d = parsed.data;
  const entry: TimelineEntry = {
    id: newId(),
    date: d.date.toISOString().slice(0, 10),
    title: d.title,
    description: d.description ?? null,
    tag: d.tag,
    order: maxOrder + 1,
    createdAt: new Date().toISOString(),
  };
  entries.push(entry);
  await writeTimeline(entries);
  return ok(entry, 201);
}
