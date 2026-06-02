// Build-time GitHub data. These functions run inside Server Components during
// `next build` (static export), so the result is baked into the static HTML —
// redeploy to refresh, exactly like the rest of the content.
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

function ghHeaders(accept = "application/vnd.github+json"): Record<string, string> {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: accept,
    // GitHub rejects API requests without a User-Agent.
    "User-Agent": "nekonotsuki-site",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/** GET a GitHub API path, returning parsed JSON or null on any failure. */
async function ghFetch(path: string): Promise<unknown | null> {
  try {
    const res = await fetch(`https://api.github.com${path}`, {
      headers: ghHeaders(),
      signal: AbortSignal.timeout(8000),
      // Cache for an hour in `next dev`; ignored by the static export build.
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export type RepoData = {
  stars: number;
  forks: number;
  /** ISO date of the last push (≈ last commit). */
  pushedAt: string | null;
  description: string | null;
  htmlUrl: string | null;
  /** `{ lang: bytes }` from the languages endpoint, or null. */
  languages: Record<string, number> | null;
};

function cleanLanguages(data: unknown): Record<string, number> | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const clean: Record<string, number> = {};
  for (const [lang, bytes] of Object.entries(data as Record<string, unknown>)) {
    if (typeof bytes === "number" && bytes > 0) clean[lang] = bytes;
  }
  return Object.keys(clean).length ? clean : null;
}

/** Fetch a repo's metadata + language breakdown. Returns null on failure. */
export async function fetchRepoData(url: string | null | undefined): Promise<RepoData | null> {
  const parsed = parseGitHubRepo(url);
  if (!parsed) return null;

  const base = `/repos/${parsed.owner}/${parsed.repo}`;
  const [repo, langs] = await Promise.all([ghFetch(base), ghFetch(`${base}/languages`)]);
  if (!repo || typeof repo !== "object") return null;
  const r = repo as Record<string, unknown>;

  return {
    stars: typeof r.stargazers_count === "number" ? r.stargazers_count : 0,
    forks: typeof r.forks_count === "number" ? r.forks_count : 0,
    pushedAt: typeof r.pushed_at === "string" ? r.pushed_at : null,
    description: typeof r.description === "string" ? r.description : null,
    htmlUrl: typeof r.html_url === "string" ? r.html_url : null,
    languages: cleanLanguages(langs),
  };
}

/** Fetch a repo's README as raw Markdown. Returns null on failure / no README. */
export async function fetchRepoReadme(url: string | null | undefined): Promise<string | null> {
  const parsed = parseGitHubRepo(url);
  if (!parsed) return null;
  try {
    const res = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}/readme`, {
      headers: ghHeaders("application/vnd.github.raw"),
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const text = await res.text();
    return text.trim() ? text : null;
  } catch {
    return null;
  }
}
