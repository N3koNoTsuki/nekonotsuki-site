// RAWG API — used ONLY locally during `next dev` to search the games database
// (for non-Steam / console games added by hand). Needs RAWG_API_KEY in .env.local.

const RAWG = "https://api.rawg.io/api";

type RawgPlatform = { platform?: { name?: string } };
type RawgGame = {
  id: number;
  slug?: string;
  name?: string;
  released?: string | null;
  background_image?: string | null;
  platforms?: RawgPlatform[] | null;
};
type RawgSearchResponse = { results?: RawgGame[] };

export type RawgResult = {
  rawgId: number;
  slug: string;
  name: string;
  cover: string | null;
  released: string | null;
  platforms: string;
};

export async function searchGames(key: string, query: string): Promise<RawgResult[]> {
  const url = `${RAWG}/games?key=${key}&search=${encodeURIComponent(query)}&page_size=8`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`RAWG API ${res.status}`);

  const data = (await res.json()) as RawgSearchResponse;
  return (data.results ?? []).map((g) => ({
    rawgId: g.id,
    slug: g.slug ?? "",
    name: g.name ?? "Sans titre",
    cover: g.background_image ?? null,
    released: g.released ?? null,
    platforms: (g.platforms ?? [])
      .map((p) => p.platform?.name)
      .filter(Boolean)
      .slice(0, 4)
      .join(", "),
  }));
}
