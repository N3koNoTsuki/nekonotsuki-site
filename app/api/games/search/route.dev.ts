import { NextRequest } from "next/server";
import { badRequest, ok } from "@/lib/api";
import { searchGames } from "@/lib/rawg";

export async function GET(req: NextRequest) {
  const key = process.env.RAWG_API_KEY;
  if (!key) return badRequest("RAWG_API_KEY manquante dans .env.local.");

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return ok([]);

  try {
    return ok(await searchGames(key, q));
  } catch (e) {
    return badRequest(e instanceof Error ? e.message : "Erreur RAWG.");
  }
}
