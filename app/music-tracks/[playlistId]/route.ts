import { NextResponse } from "next/server";
import { readMusic } from "@/lib/content";

// Per-playlist tracklists served as JSON so /musique can stay light: the page
// ships playlist metadata only, and the popup fetches /music-tracks/<id> when
// it opens. Prerendered for every visible playlist at build time (force-static
// + dynamicParams=false) — like the rest of the "fetch au dev" content, prod
// serves static data straight from content/music.json, no key, no runtime work.
export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  const music = await readMusic();
  return music.filter((p) => p.visible).map((p) => ({ playlistId: p.playlistId }));
}

export async function GET(_req: Request, { params }: { params: { playlistId: string } }) {
  const music = await readMusic();
  const playlist = music.find((p) => p.playlistId === params.playlistId && p.visible);
  if (!playlist) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ tracks: playlist.tracks });
}
