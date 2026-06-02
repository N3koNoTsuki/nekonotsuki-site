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

export const timelineSchema = z.object({
  title: z.string().trim().min(1, "Titre requis"),
  date: z.coerce.date(),
  description: optionalString,
  tag: z.enum(["etudes", "pro", "perso", "projet"]).default("perso"),
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
