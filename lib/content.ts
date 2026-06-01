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
  rating: number | null;
  comment: string | null;
  order: number;
  categoryId: string;
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

export const readPages = () => read<Page>("pages.json");
export const writePages = (p: Page[]) => write("pages.json", p);

/** New random id for created records. */
export const newId = () => randomUUID();
