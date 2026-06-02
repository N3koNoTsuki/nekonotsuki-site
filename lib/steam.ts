// Steam Web API — used ONLY locally during `next dev` to sync the owned-games
// library (with playtime) into content/games.json. Needs STEAM_API_KEY +
// STEAM_ID in .env.local, and the profile's "Game details" set to Public.

const STEAM = "https://api.steampowered.com";

type SteamGame = { appid: number; name?: string; playtime_forever?: number };
type OwnedResponse = { response?: { game_count?: number; games?: SteamGame[] } };

export type SteamGameData = {
  appId: number;
  name: string;
  playtimeMinutes: number;
  cover: string;
};

export async function fetchOwnedGames(key: string, steamId: string): Promise<SteamGameData[]> {
  const url =
    `${STEAM}/IPlayerService/GetOwnedGames/v1/?key=${key}&steamid=${steamId}` +
    `&include_appinfo=true&include_played_free_games=true&format=json`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Steam API ${res.status}`);

  const data = (await res.json()) as OwnedResponse;
  const games = data.response?.games;
  if (!games) {
    throw new Error('Steam : aucune donnée — mets « Détails du jeu » en Public dans la confidentialité du profil.');
  }

  return games.map((g) => ({
    appId: g.appid,
    name: g.name ?? "",
    playtimeMinutes: g.playtime_forever ?? 0,
    cover: `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/header.jpg`,
  }));
}
