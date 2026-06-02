// YouTube Data API v3 — used ONLY locally during `next dev` to sync the
// channel's playlists into content/music.json (which is committed to git). The
// live site reads that JSON statically: no key and no runtime call in prod.

const YT = "https://www.googleapis.com/youtube/v3";

type Thumb = { url?: string };
type Thumbnails = {
  default?: Thumb;
  medium?: Thumb;
  high?: Thumb;
  standard?: Thumb;
  maxres?: Thumb;
};
type Snippet = {
  title?: string;
  description?: string;
  thumbnails?: Thumbnails;
  resourceId?: { videoId?: string };
};
type PlaylistResource = { id?: string; snippet?: Snippet; contentDetails?: { itemCount?: number } };
type PlaylistItemResource = { snippet?: Snippet };
type ListResponse<T> = { items?: T[]; nextPageToken?: string };

export type YtPlaylist = {
  playlistId: string;
  title: string;
  description: string;
  thumbnail: string | null;
  itemCount: number;
};
export type YtTrack = { videoId: string; title: string };

function bestThumb(t: Thumbnails | undefined): string | null {
  if (!t) return null;
  return t.maxres?.url ?? t.standard?.url ?? t.high?.url ?? t.medium?.url ?? t.default?.url ?? null;
}

async function ytGet<T>(path: string, params: Record<string, string>, key: string): Promise<T> {
  const url = new URL(`${YT}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("key", key);
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube API ${res.status} — ${body.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

/** Resolve a channel ID from its @handle (pass the handle without the @). */
export async function resolveChannelId(handle: string, key: string): Promise<string | null> {
  const data = await ytGet<ListResponse<PlaylistResource>>("channels", { part: "id", forHandle: handle }, key);
  return data.items?.[0]?.id ?? null;
}

/** All public playlists of a channel (paginated). */
export async function fetchChannelPlaylists(channelId: string, key: string): Promise<YtPlaylist[]> {
  const out: YtPlaylist[] = [];
  let pageToken = "";
  do {
    const params: Record<string, string> = { part: "snippet,contentDetails", channelId, maxResults: "50" };
    if (pageToken) params.pageToken = pageToken;
    const data = await ytGet<ListResponse<PlaylistResource>>("playlists", params, key);
    for (const it of data.items ?? []) {
      if (!it.id) continue;
      out.push({
        playlistId: it.id,
        title: it.snippet?.title ?? "",
        description: it.snippet?.description ?? "",
        thumbnail: bestThumb(it.snippet?.thumbnails),
        itemCount: it.contentDetails?.itemCount ?? 0,
      });
    }
    pageToken = data.nextPageToken ?? "";
  } while (pageToken);
  return out;
}

/** A playlist's videos (all pages). Skips deleted/private entries. */
export async function fetchPlaylistTracks(playlistId: string, key: string): Promise<YtTrack[]> {
  const out: YtTrack[] = [];
  let pageToken = "";
  do {
    const params: Record<string, string> = { part: "snippet", playlistId, maxResults: "50" };
    if (pageToken) params.pageToken = pageToken;
    const data = await ytGet<ListResponse<PlaylistItemResource>>("playlistItems", params, key);
    for (const it of data.items ?? []) {
      const videoId = it.snippet?.resourceId?.videoId;
      const title = it.snippet?.title ?? "";
      if (!videoId || title === "Deleted video" || title === "Private video") continue;
      out.push({ videoId, title });
    }
    pageToken = data.nextPageToken ?? "";
  } while (pageToken);
  return out;
}
