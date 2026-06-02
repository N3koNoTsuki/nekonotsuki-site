import { readMusic } from "@/lib/content";
import { ok } from "@/lib/api";

export async function GET() {
  const music = await readMusic();
  return ok([...music].sort((a, b) => a.order - b.order || b.createdAt.localeCompare(a.createdAt)));
}
