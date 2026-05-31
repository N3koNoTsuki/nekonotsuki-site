import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { requireAuth, badRequest, ok } from "@/lib/api";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"]);
const EXT: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
};

export async function POST(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return badRequest("Aucun fichier fourni (champ 'file').");
  }
  if (!ALLOWED.has(file.type)) {
    return badRequest(`Type non supporté: ${file.type}. Formats: png, jpg, webp, gif, svg.`);
  }
  if (file.size > MAX_BYTES) {
    return badRequest("Fichier trop volumineux (max 5 Mo).");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}${EXT[file.type] ?? ""}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), bytes);

  // Public URL served by Next from /public
  return ok({ url: `/uploads/${filename}` }, 201);
}
