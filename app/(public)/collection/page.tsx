import type { Metadata } from "next";
import { PageHeader, EmptyState } from "@/components/ui";
import Reveal from "@/components/Reveal";
import CollectionCard from "@/components/CollectionCard";
import { fetchMalProfile } from "@/lib/mal";
import { getAnime, getManga } from "@/lib/data";

export const metadata: Metadata = { title: "Collection" };

// ISR: re-fetch the MyAnimeList data ~hourly.
export const revalidate = 3600;

// MyAnimeList username (public profile).
const MAL_USERNAME = "NekoNoTsuki";
const MANGACOLLEC_URL = "https://www.mangacollec.com/user/nekonotsuki/collection";

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-2xl font-bold text-rose-deep">{value.toLocaleString("fr-FR")}</div>
      <div className="text-xs text-ink/55 dark:text-[#efe6ee]/55">{label}</div>
    </div>
  );
}

export default async function CollectionPage() {
  const [mal, anime, manga] = await Promise.all([fetchMalProfile(MAL_USERNAME), getAnime(), getManga()]);

  return (
    <div className="space-y-12">
      <PageHeader emoji="🗂️" title="Ma collection" subtitle="Mes anime, mangas et sons préférés" />

      <Reveal as="section">
        <div className="mb-4 flex items-end justify-between gap-2">
          <h2 className="font-display text-2xl font-bold text-lavender-deep">
            <span className="mr-1" aria-hidden>
              🌸
            </span>
            Anime
          </h2>
          <a
            href={mal?.profileUrl ?? `https://myanimelist.net/profile/${MAL_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-rose-deep hover:underline"
          >
            Mon profil MAL →
          </a>
        </div>

        <div className="space-y-6">
          {mal?.animeStats && (
            <div className="kawaii-card flex flex-wrap items-center justify-around gap-y-4 p-5">
              <Stat value={mal.animeStats.completed} label="complétés" />
              <Stat value={mal.animeStats.watching} label="en cours" />
              <Stat value={mal.animeStats.planToWatch} label="à voir" />
              <Stat value={mal.animeStats.episodesWatched} label="épisodes" />
              <Stat value={Math.round(mal.animeStats.daysWatched)} label="jours" />
            </div>
          )}

          {anime.length === 0 ? (
            <EmptyState>Mes anime favoris arrivent vite. 🌸</EmptyState>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {anime.map((a) => (
                <CollectionCard
                  key={a.id}
                  title={a.title}
                  href={a.url}
                  imageUrl={a.imageUrl}
                  subtitle={[a.type, a.year].filter(Boolean).join(" · ") || null}
                />
              ))}
            </div>
          )}
        </div>
      </Reveal>

      <Reveal as="section" delay={80}>
        <div className="mb-4 flex items-end justify-between gap-2">
          <h2 className="font-display text-2xl font-bold text-lavender-deep">
            <span className="mr-1" aria-hidden>
              📚
            </span>
            Manga
          </h2>
          <a
            href={MANGACOLLEC_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-rose-deep hover:underline"
          >
            Ma collection MangaCollec →
          </a>
        </div>

        {manga.length === 0 ? (
          <EmptyState>Mes mangas préférés arrivent vite. 📚</EmptyState>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {manga.map((m) => (
              <CollectionCard
                key={m.id}
                title={m.title}
                href={m.url}
                imageUrl={m.imageUrl}
                subtitle={[m.type, m.year].filter(Boolean).join(" · ") || null}
                fallback="📚"
              />
            ))}
          </div>
        )}
      </Reveal>

    </div>
  );
}
