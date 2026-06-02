import MusicManager from "@/components/admin/MusicManager";
import { readMusic } from "@/lib/content";
import type { MusicDTO } from "@/lib/types";

export default async function EditMusicPage() {
  const music = await readMusic();
  const initialMusic: MusicDTO[] = [...music]
    .sort((a, b) => a.order - b.order || b.createdAt.localeCompare(a.createdAt))
    .map((m) => ({
      id: m.id,
      playlistId: m.playlistId,
      title: m.title,
      description: m.description ?? "",
      thumbnail: m.thumbnail ?? null,
      url: m.url,
      itemCount: m.itemCount ?? 0,
      visible: m.visible ?? true,
      order: m.order,
    }));

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold text-rose-deep">Musique (Collection)</h1>
        <p className="text-ink/60 dark:text-[#efe6ee]/60">
          Synchronise tes playlists YouTube, puis choisis lesquelles afficher sur la page Musique.
        </p>
      </header>
      <div className="glass p-6">
        <MusicManager initialMusic={initialMusic} />
      </div>
    </div>
  );
}
