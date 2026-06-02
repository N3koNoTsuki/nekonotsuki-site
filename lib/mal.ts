// MyAnimeList data via Jikan (https://jikan.moe) — the public, key-less MAL API.
// Fetched at build time inside Server Components and baked into the static HTML,
// like the GitHub data. Fail-soft: every call returns null on error so a slow or
// rate-limited Jikan can never break the build.

const JIKAN = "https://api.jikan.moe/v4";

export type MalStats = {
  daysWatched: number;
  meanScore: number;
  watching: number;
  completed: number;
  onHold: number;
  dropped: number;
  planToWatch: number;
  totalEntries: number;
  episodesWatched: number;
};

export type MalFavorite = {
  malId: number;
  title: string;
  url: string;
  imageUrl: string | null;
  type: string | null;
  year: number | null;
};

export type MalProfile = {
  username: string;
  profileUrl: string;
  avatarUrl: string | null;
  animeStats: MalStats | null;
  animeFavorites: MalFavorite[];
};

function num(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}
function str(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}
function rec(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

function parseStats(raw: unknown): MalStats | null {
  const s = rec(raw);
  if (Object.keys(s).length === 0) return null;
  return {
    daysWatched: num(s.days_watched),
    meanScore: num(s.mean_score),
    watching: num(s.watching),
    completed: num(s.completed),
    onHold: num(s.on_hold),
    dropped: num(s.dropped),
    planToWatch: num(s.plan_to_watch),
    totalEntries: num(s.total_entries),
    episodesWatched: num(s.episodes_watched),
  };
}

function parseFavorites(raw: unknown): MalFavorite[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const a = rec(item);
    const jpg = rec(rec(a.images).jpg);
    const webp = rec(rec(a.images).webp);
    return {
      malId: num(a.mal_id),
      title: str(a.title) ?? "Sans titre",
      url: str(a.url) ?? "#",
      imageUrl: str(jpg.image_url) ?? str(webp.image_url),
      type: str(a.type),
      year: num(a.start_year) || null,
    };
  });
}

/** Fetch a MAL user's anime stats + favorites. Returns null on failure. */
export async function fetchMalProfile(username: string): Promise<MalProfile | null> {
  try {
    const res = await fetch(`${JIKAN}/users/${encodeURIComponent(username)}/full`, {
      headers: { Accept: "application/json", "User-Agent": "nekonotsuki-site" },
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;

    const d = rec(rec(await res.json()).data);
    if (Object.keys(d).length === 0) return null;
    const jpg = rec(rec(d.images).jpg);
    const webp = rec(rec(d.images).webp);

    return {
      username: str(d.username) ?? username,
      profileUrl: str(d.url) ?? `https://myanimelist.net/profile/${username}`,
      avatarUrl: str(jpg.image_url) ?? str(webp.image_url),
      animeStats: parseStats(rec(d.statistics).anime),
      animeFavorites: parseFavorites(rec(d.favorites).anime),
    };
  } catch {
    return null;
  }
}
