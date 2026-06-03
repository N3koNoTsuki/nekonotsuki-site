import { NextRequest } from "next/server";
import { readFeaturedMusic, writeFeaturedMusic, newId, type FeaturedTrack } from "@/lib/content";
import { badRequest, ok } from "@/lib/api";
import { featuredTrackSchema } from "@/lib/validators";

export async function GET() {
  const tracks = await readFeaturedMusic();
  return ok([...tracks].sort((a, b) => a.order - b.order || b.createdAt.localeCompare(a.createdAt)));
}

export async function POST(req: NextRequest) {
  const parsed = featuredTrackSchema.safeParse(await req.json());
  if (!parsed.success) return badRequest("Données invalides", parsed.error.flatten());

  const tracks = await readFeaturedMusic();
  if (tracks.some((t) => t.videoId === parsed.data.videoId)) return badRequest("Titre déjà mis en avant.");

  const maxOrder = tracks.reduce((m, t) => Math.max(m, t.order), -1);
  const d = parsed.data;
  const track: FeaturedTrack = {
    id: newId(),
    videoId: d.videoId,
    title: d.title,
    comment: d.comment ?? "",
    order: maxOrder + 1,
    createdAt: new Date().toISOString(),
  };
  tracks.push(track);
  await writeFeaturedMusic(tracks);
  return ok(track, 201);
}
