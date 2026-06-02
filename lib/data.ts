import {
  readBlocks,
  readProjects,
  readFavorites,
  readManga,
  readAnime,
  readMusic,
  readGames,
  readCategories,
  readTimeline,
  readPages,
  type Project,
} from "@/lib/content";

// Public pages read straight from the JSON content files (server components),
// so they render fully on the server and bake into static HTML at build time.

function sortProjects(projects: Project[]): Project[] {
  return [...projects].sort(
    (a, b) =>
      Number(b.featured) - Number(a.featured) ||
      a.order - b.order ||
      b.createdAt.localeCompare(a.createdAt),
  );
}

export async function getHomeBlocks() {
  const blocks = await readBlocks();
  return blocks.filter((b) => b.visible).sort((a, b) => a.order - b.order);
}

export async function getLatestProjects(count = 3) {
  return sortProjects(await readProjects()).slice(0, count);
}

export async function getAllProjects() {
  return sortProjects(await readProjects());
}

export async function getLatestFavorites(count = 4) {
  const [favorites, categories] = await Promise.all([readFavorites(), readCategories()]);
  const byId = new Map(categories.map((c) => [c.id, c]));
  return [...favorites]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, count)
    .map((f) => {
      const cat = byId.get(f.categoryId);
      return { ...f, category: cat ? { name: cat.name, icon: cat.icon } : null };
    });
}

export async function getLatestTimeline(count = 1) {
  const entries = await readTimeline();
  return [...entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, count);
}

export async function getCategoriesWithFavorites() {
  const [categories, favorites] = await Promise.all([readCategories(), readFavorites()]);
  return [...categories]
    .sort((a, b) => a.order - b.order)
    .map((c) => ({
      ...c,
      items: favorites
        .filter((f) => f.categoryId === c.id)
        .sort((a, b) => a.order - b.order || b.createdAt.localeCompare(a.createdAt)),
    }));
}

export async function getTimeline() {
  const entries = await readTimeline();
  return [...entries].sort((a, b) => b.date.localeCompare(a.date) || a.order - b.order);
}

export async function getManga() {
  const manga = await readManga();
  return [...manga].sort((a, b) => a.order - b.order || b.createdAt.localeCompare(a.createdAt));
}

export async function getAnime() {
  const anime = await readAnime();
  return [...anime].sort((a, b) => a.order - b.order || b.createdAt.localeCompare(a.createdAt));
}

export async function getMusic() {
  const music = await readMusic();
  return [...music].sort((a, b) => a.order - b.order || b.createdAt.localeCompare(a.createdAt));
}

export async function getGames() {
  const games = await readGames();
  return [...games].sort((a, b) => a.order - b.order || b.createdAt.localeCompare(a.createdAt));
}

export async function getPage(slug: string) {
  const pages = await readPages();
  return pages.find((p) => p.slug === slug) ?? null;
}
