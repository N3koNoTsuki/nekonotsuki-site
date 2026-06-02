import { NextRequest } from "next/server";
import { readMusic, writeMusic, newId, type MusicPlaylist } from "@/lib/content";
import { badRequest, ok } from "@/lib/api";
import { resolveChannelId, fetchChannelPlaylists, fetchPlaylistTracks } from "@/lib/youtube";

// The channel whose playlists we sync (handle without the @).
const HANDLE = "Neko_no_tsuki";

export async function POST(_req: NextRequest) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    return badRequest("Clé YOUTUBE_API_KEY manquante — ajoute-la dans .env.local puis relance `npm run dev`.");
  }

  try {
    const channelId = await resolveChannelId(HANDLE, key);
    if (!channelId) return badRequest(`Chaîne @${HANDLE} introuvable.`);

    const playlists = await fetchChannelPlaylists(channelId, key);
    const existing = await readMusic();
    const previous = new Map(existing.map((p) => [p.playlistId, p]));

    const result: MusicPlaylist[] = [];
    for (let i = 0; i < playlists.length; i++) {
      const pl = playlists[i];
      const prev = previous.get(pl.playlistId);
      const tracks = await fetchPlaylistTracks(pl.playlistId, key);
      result.push({
        id: prev?.id ?? newId(),
        playlistId: pl.playlistId,
        title: pl.title,
        description: pl.description,
        thumbnail: pl.thumbnail,
        url: `https://www.youtube.com/playlist?list=${pl.playlistId}`,
        itemCount: pl.itemCount,
        visible: prev?.visible ?? true, // new playlists shown by default
        order: prev?.order ?? i,
        tracks,
        createdAt: prev?.createdAt ?? new Date().toISOString(),
      });
    }

    result.sort((a, b) => a.order - b.order);
    await writeMusic(result);
    return ok(result);
  } catch (e) {
    return badRequest(e instanceof Error ? e.message : "Erreur de synchronisation YouTube.");
  }
}
