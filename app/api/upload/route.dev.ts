import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { badRequest, ok } from "@/lib/api";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB
const EXT: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
  "video/ogg": ".ogv",
};
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime", "video/ogg"]);

// Local-only (dev). Writes into /public/uploads, which is committed to git and
// shipped as part of the static site.
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return badRequest("Aucun fichier fourni (champ 'file').");
  }
  if (!(file.type in EXT)) {
    return badRequest(`Type non supporté: ${file.type}. Images (png, jpg, webp, gif, svg) ou vidéos (mp4, webm, mov).`);
  }
  const isVideo = VIDEO_TYPES.has(file.type);
  if (file.size > (isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES)) {
    return badRequest(`Fichier trop volumineux (max ${isVideo ? "50" : "5"} Mo).`);
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}${EXT[file.type] ?? ""}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), bytes);

  return ok({ url: `/uploads/${filename}` }, 201);
}
