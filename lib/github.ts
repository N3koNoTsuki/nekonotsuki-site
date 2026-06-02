// Build-time GitHub language stats. These functions run inside Server
// Components during `next build` (static export), so the result is baked into
// the static HTML — redeploy to refresh, exactly like the rest of the content.
//
// Public repos need no auth (60 req/h per IP). Set GITHUB_TOKEN in the Vercel
// project env to raise that to 5000/h. Every call fails soft (returns null and
// never throws) so a rate-limit or network blip can never break the build.

/** Extract `{ owner, repo }` from an https or ssh GitHub URL, or null. */
export function parseGitHubRepo(url: string | null | undefined): { owner: string; repo: string } | null {
  if (!url) return null;
  const match = url.match(/github\.com[/:]([^/]+)\/([^/#?]+)/i);
  if (!match) return null;
  const owner = match[1];
  const repo = match[2].replace(/\.git$/i, "");
  if (!owner || !repo) return null;
  return { owner, repo };
}

/** Fetch `{ lang: bytes }` for a repo. Returns null on any failure. */
export async function fetchRepoLanguages(
  url: string | null | undefined,
): Promise<Record<string, number> | null> {
  const parsed = parseGitHubRepo(url);
  if (!parsed) return null;

  const token = process.env.GITHUB_TOKEN;
  try {
    const res = await fetch(
      `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/languages`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          // GitHub rejects API requests without a User-Agent.
          "User-Agent": "nekonotsuki-site",
          "X-GitHub-Api-Version": "2022-11-28",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: AbortSignal.timeout(8000),
        // Cache for an hour in `next dev`; ignored by the static export build.
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return null;

    const data: unknown = await res.json();
    if (!data || typeof data !== "object" || Array.isArray(data)) return null;

    const clean: Record<string, number> = {};
    for (const [lang, bytes] of Object.entries(data as Record<string, unknown>)) {
      if (typeof bytes === "number" && bytes > 0) clean[lang] = bytes;
    }
    return Object.keys(clean).length ? clean : null;
  } catch {
    return null;
  }
}
