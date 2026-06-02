import type { Metadata } from "next";
import { getMusic } from "@/lib/data";
import { PageHeader, EmptyState } from "@/components/ui";
import MusicGallery from "@/components/MusicGallery";

export const metadata: Metadata = { title: "Musique" };

export default async function MusiquePage() {
  const all = await getMusic();
  const playlists = all
    .filter((p) => p.visible)
    .map((p) => ({
      id: p.id,
      playlistId: p.playlistId,
      title: p.title,
      description: p.description ?? "",
      thumbnail: p.thumbnail ?? null,
      itemCount: p.itemCount ?? p.tracks.length,
      url: p.url,
      tracks: p.tracks ?? [],
    }));

  return (
    <div>
      <PageHeader emoji="🎵" title="Ma musique" subtitle="Mes playlists YouTube — clique pour écouter" />

      {playlists.length === 0 ? (
        <EmptyState>Mes playlists arrivent vite. 🎵</EmptyState>
      ) : (
        <MusicGallery playlists={playlists} />
      )}
    </div>
  );
}
