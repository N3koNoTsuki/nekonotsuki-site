// Flat-file content store. The whole site's content lives in /content/*.json,
// versioned in git. Public pages READ these at build time (static export);
// the local /edit interface WRITES them (dev only). No database involved.

import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const CONTENT_DIR = path.join(process.cwd(), "content");

// ---- Stored record shapes (kept close to the old Prisma models) ----

export type Block = {
  id: string;
  type: string;
  title: string | null;
  content: string | null;
  config: string | null; // JSON string, e.g. {"count":3}
  order: number;
  visible: boolean;
  createdAt: string;
};

export type Project = {
  id: string;
  title: string;
  coverUrl: string | null;
  description: string | null;
  tags: string; // comma-separated
  githubUrl: string | null;
  demoUrl: string | null;
  featured: boolean;
  order: number;
  createdAt: string;
};

export type TimelineEntry = {
  id: string;
  date: string; // yyyy-mm-dd
  title: string;
  description: string | null;
  tag: string;
  order: number;
  createdAt: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  order: number;
  createdAt: string;
};

export type Favorite = {
  id: string;
  title: string;
  imageUrl: string | null;
  description: string | null;
  details: string | null; // long-form Markdown shown only in the expanded view
  rating: number | null;
  comment: string | null;
  order: number;
  categoryId: string;
  createdAt: string;
};

// A picked MyAnimeList entry — shared by the manga and anime collections.
export type MalPick = {
  id: string;
  malId: number;
  title: string;
  imageUrl: string | null;
  url: string; // MyAnimeList page
  type: string | null;
  year: number | null;
  order: number;
  createdAt: string;
};

export type MusicTrack = {
  videoId: string;
  title: string;
};

export type MusicPlaylist = {
  id: string;
  playlistId: string;
  title: string;
  description: string;
  thumbnail: string | null;
  url: string;
  itemCount: number;
  visible: boolean;
  order: number;
  tracks: MusicTrack[];
  createdAt: string;
};

export type Page = {
  slug: string;
  title: string | null;
  content: string;
};

// ---- Low-level JSON helpers ----

async function read<T>(file: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(path.join(CONTENT_DIR, file), "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? (data as T[]) : [];
  } catch (err) {
    if ((err as NodeJS.ErrnoException)?.code === "ENOENT") return [];
    throw err;
  }
}

async function write<T>(file: string, data: T[]): Promise<void> {
  await fs.mkdir(CONTENT_DIR, { recursive: true });
  await fs.writeFile(path.join(CONTENT_DIR, file), JSON.stringify(data, null, 2) + "\n", "utf8");
}

// ---- Typed accessors ----

export const readBlocks = () => read<Block>("home.json");
export const writeBlocks = (b: Block[]) => write("home.json", b);

export const readProjects = () => read<Project>("projects.json");
export const writeProjects = (p: Project[]) => write("projects.json", p);

export const readTimeline = () => read<TimelineEntry>("timeline.json");
export const writeTimeline = (t: TimelineEntry[]) => write("timeline.json", t);

export const readCategories = () => read<Category>("categories.json");
export const writeCategories = (c: Category[]) => write("categories.json", c);

export const readFavorites = () => read<Favorite>("favorites.json");
export const writeFavorites = (f: Favorite[]) => write("favorites.json", f);

export const readManga = () => read<MalPick>("manga.json");
export const writeManga = (m: MalPick[]) => write("manga.json", m);

export const readAnime = () => read<MalPick>("anime.json");
export const writeAnime = (a: MalPick[]) => write("anime.json", a);

export const readMusic = () => read<MusicPlaylist>("music.json");
export const writeMusic = (m: MusicPlaylist[]) => write("music.json", m);

export const readPages = () => read<Page>("pages.json");
export const writePages = (p: Page[]) => write("pages.json", p);

/** New random id for created records. */
export const newId = () => randomUUID();
