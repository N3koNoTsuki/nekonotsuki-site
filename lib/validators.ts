import { z } from "zod";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" ? undefined : v));

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" ? undefined : v))
  .refine((v) => v === undefined || /^(https?:\/\/|\/)/.test(v), {
    message: "URL invalide",
  });

export const blockSchema = z.object({
  type: z.enum(["intro", "latest-projects", "latest-favorites", "latest-timeline", "custom"]),
  title: optionalString,
  content: optionalString,
  config: optionalString,
  visible: z.boolean().optional(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Nom requis"),
  slug: optionalString,
  icon: optionalString,
});

export const favoriteSchema = z.object({
  title: z.string().trim().min(1, "Titre requis"),
  categoryId: z.string().min(1, "Catégorie requise"),
  imageUrl: optionalUrl,
  description: optionalString,
  details: optionalString,
  rating: z.coerce.number().int().min(0).max(5).optional(),
  comment: optionalString,
});

export const malPickSchema = z.object({
  malId: z.number().int().optional(),
  title: z.string().trim().min(1, "Titre requis"),
  imageUrl: optionalUrl,
  url: optionalUrl,
  type: optionalString,
  year: z.number().int().nullable().optional(),
});

export const musicSchema = z.object({
  url: z.string().trim().min(1, "Lien requis"),
  title: z.string().trim().min(1, "Titre requis"),
});

// A track highlighted above the playlists (picked from an existing playlist).
export const featuredTrackSchema = z.object({
  videoId: z.string().trim().min(1, "videoId requis"),
  title: z.string().trim().min(1, "Titre requis"),
  comment: optionalString,
});

// Editing a playlist's personal fields (comment).
export const musicEditSchema = z.object({
  visible: z.boolean().optional(),
  comment: optionalString,
});

// Adding a non-Steam game picked from RAWG.
export const rawgGameSchema = z.object({
  rawgId: z.number().int(),
  slug: optionalString,
  name: z.string().trim().min(1, "Titre requis"),
  cover: optionalUrl,
  released: optionalString,
  platforms: optionalString,
});

// Editing a game's personal fields.
export const gameEditSchema = z.object({
  highlight: z.boolean().optional(),
  rating: z.coerce.number().int().min(0).max(5).nullable().optional(),
  playtimeMinutes: z.coerce.number().int().min(0).nullable().optional(),
  review: z.string().optional(),
  clips: z.array(z.string().trim()).optional(),
  visible: z.boolean().optional(),
});

// Optional end date: empty string / null become null, otherwise a real date.
const optionalDate = z.preprocess(
  (v) => (v === "" || v === undefined || v === null ? null : v),
  z.coerce.date().nullable(),
);

export const timelineSchema = z.object({
  title: z.string().trim().min(1, "Titre requis"),
  date: z.coerce.date(),
  endDate: optionalDate,
  description: optionalString,
  // Free-form category so new ones can be created from the editor.
  tag: z.string().trim().min(1, "Catégorie requise").default("perso"),
});

export const projectSchema = z.object({
  title: z.string().trim().min(1, "Titre requis"),
  coverUrl: optionalUrl,
  description: optionalString,
  tags: z.string().optional().transform((v) => v ?? ""),
  githubUrl: optionalUrl,
  demoUrl: optionalUrl,
  featured: z.boolean().optional(),
});

export const pageSchema = z.object({
  title: optionalString,
  content: z.string(),
});

export const reorderSchema = z.object({
  ids: z.array(z.string()).min(1),
});
