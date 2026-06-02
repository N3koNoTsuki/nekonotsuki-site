/** Tiny classnames helper (no extra deps). */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Parse a comma-separated tag string into a clean array. */
export function parseTags(tags: string | null | undefined): string[] {
  if (!tags) return [];
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Format a Date into a French long date. */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/** Format just month + year (used in the timeline). */
export function formatMonthYear(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "long",
  }).format(d);
}

/** Relative time from now, in French (e.g. "il y a 3 jours"). Computed at build. */
export function formatRelativeFromNow(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = (d.getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, secs] of units) {
    if (Math.abs(seconds) >= secs) return rtf.format(Math.round(seconds / secs), unit);
  }
  return rtf.format(Math.round(seconds), "second");
}

/** Kebab-case slug from arbitrary text. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60) || "item";
}

/** Timeline tag → label + colour classes. */
export const TIMELINE_TAGS = {
  etudes: { label: "Études", className: "bg-sky/60 text-ink" },
  pro: { label: "Pro", className: "bg-lavender-soft text-lavender-deep" },
  perso: { label: "Perso", className: "bg-rose-soft text-rose-deep" },
  projet: { label: "Projet", className: "bg-mint/70 text-ink" },
} as const;

export type TimelineTag = keyof typeof TIMELINE_TAGS;

export function tagMeta(tag: string) {
  return (
    TIMELINE_TAGS[tag as TimelineTag] ?? {
      label: tag,
      className: "bg-cream text-ink",
    }
  );
}

/** Extract a YouTube playlist ID from a URL (or accept a raw ID). */
export function extractPlaylistId(input: string | null | undefined): string | null {
  if (!input) return null;
  const s = input.trim();
  const match = s.match(/[?&]list=([A-Za-z0-9_-]+)/);
  if (match) return match[1];
  // A bare playlist ID (no slashes/spaces, plausible length).
  if (/^[A-Za-z0-9_-]{10,}$/.test(s)) return s;
  return null;
}
