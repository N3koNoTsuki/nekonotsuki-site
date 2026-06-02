import MediaPicker from "@/components/admin/MediaPicker";
import { readManga } from "@/lib/content";
import type { MalPickDTO } from "@/lib/types";

export default async function EditMangaPage() {
  const manga = await readManga();
  const initialItems: MalPickDTO[] = [...manga]
    .sort((a, b) => a.order - b.order || b.createdAt.localeCompare(a.createdAt))
    .map((m) => ({
      id: m.id,
      malId: m.malId,
      title: m.title,
      imageUrl: m.imageUrl,
      url: m.url,
      type: m.type,
      year: m.year,
      order: m.order,
    }));

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold text-rose-deep">Manga (Collection)</h1>
        <p className="text-ink/60 dark:text-[#efe6ee]/60">
          Cherche un manga et ajoute-le — il s’affiche dans la section Manga de la page Collection.
        </p>
      </header>
      <div className="glass p-6">
        <MediaPicker kind="manga" initialItems={initialItems} />
      </div>
    </div>
  );
}
