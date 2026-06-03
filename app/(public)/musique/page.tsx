import type { Metadata } from "next";
import { getMusic, getFeaturedMusic } from "@/lib/data";
import { PageHeader, EmptyState } from "@/components/ui";
import MusicGallery from "@/components/MusicGallery";

export const metadata: Metadata = { title: "Musique" };

export default async function MusiquePage() {
  const [all, featuredRaw] = await Promise.all([getMusic(), getFeaturedMusic()]);
  const playlists = all
    .filter((p) => p.visible)
    .map((p) => ({
      id: p.id,
      playlistId: p.playlistId,
      title: p.title,
      description: p.description ?? "",
      comment: p.comment ?? "",
      thumbnail: p.thumbnail ?? null,
      itemCount: p.itemCount ?? p.tracks.length,
      url: p.url,
      tracks: p.tracks ?? [],
    }));
  const featured = featuredRaw.map((f) => ({
    id: f.id,
    videoId: f.videoId,
    title: f.title,
    comment: f.comment ?? "",
  }));

  return (
    <div>
      <PageHeader emoji="🎵" title="Ma musique" subtitle="Mes playlists YouTube — clique pour écouter" />

      {playlists.length === 0 && featured.length === 0 ? (
        <EmptyState>Mes playlists arrivent vite. 🎵</EmptyState>
      ) : (
        <MusicGallery playlists={playlists} featured={featured} />
      )}
    </div>
  );
}
