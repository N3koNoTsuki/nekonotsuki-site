import MusicManager, { type PickableTrack } from "@/components/admin/MusicManager";
import { readMusic, readFeaturedMusic } from "@/lib/content";
import type { MusicDTO, FeaturedTrackDTO } from "@/lib/types";

export default async function EditMusicPage() {
  const [music, featured] = await Promise.all([readMusic(), readFeaturedMusic()]);

  const sorted = [...music].sort((a, b) => a.order - b.order || b.createdAt.localeCompare(a.createdAt));
  const initialMusic: MusicDTO[] = sorted.map((m) => ({
    id: m.id,
    playlistId: m.playlistId,
    title: m.title,
    description: m.description ?? "",
    comment: m.comment ?? "",
    thumbnail: m.thumbnail ?? null,
    url: m.url,
    itemCount: m.itemCount ?? 0,
    visible: m.visible ?? true,
    order: m.order,
  }));

  const initialFeatured: FeaturedTrackDTO[] = [...featured]
    .sort((a, b) => a.order - b.order || b.createdAt.localeCompare(a.createdAt))
    .map((f) => ({ id: f.id, videoId: f.videoId, title: f.title, comment: f.comment ?? "", order: f.order }));

  // Flattened, de-duplicated track list to pick "featured" tracks from.
  const seen = new Set<string>();
  const allTracks: PickableTrack[] = [];
  for (const m of sorted) {
    for (const t of m.tracks ?? []) {
      if (!t.videoId || seen.has(t.videoId)) continue;
      seen.add(t.videoId);
      allTracks.push({ videoId: t.videoId, title: t.title, playlist: m.title });
    }
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold text-rose-deep">Musique (Collection)</h1>
        <p className="text-ink/60 dark:text-nightink/60">
          Synchronise tes playlists YouTube, mets quelques titres en avant et choisis lesquelles afficher.
        </p>
      </header>
      <div className="glass p-6">
        <MusicManager initialMusic={initialMusic} initialFeatured={initialFeatured} allTracks={allTracks} />
      </div>
    </div>
  );
}
