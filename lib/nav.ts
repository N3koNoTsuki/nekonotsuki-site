// Single source of truth for the site's navigation. The navbar (top) and the
// footer sitemap both read from here so the two can never drift apart.

export type NavItem = { href: string; label: string };

// Primary links stay inline on desktop; the rest fold into the "Plus" dropdown.
export const PRIMARY: NavItem[] = [
  { href: "/", label: "Accueil" },
  { href: "/projects", label: "Projets" },
  { href: "/favorites", label: "Favoris" },
  { href: "/timeline", label: "Parcours" },
  { href: "/about", label: "À propos" },
];

export const MORE: NavItem[] = [
  { href: "/collection", label: "Collection" },
  { href: "/musique", label: "Musique" },
  { href: "/jeux", label: "Jeux" },
  { href: "/competences", label: "Compétences" },
  { href: "/setup", label: "Setup" },
];

export const ALL: NavItem[] = [...PRIMARY, ...MORE];

// Footer sitemap — same destinations, grouped for a visitor.
export const FOOTER_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "✨ Explorer",
    items: [
      { href: "/projects", label: "Projets" },
      { href: "/competences", label: "Compétences" },
      { href: "/timeline", label: "Parcours" },
      { href: "/about", label: "À propos" },
    ],
  },
  {
    title: "💗 Passions",
    items: [
      { href: "/collection", label: "Collection" },
      { href: "/musique", label: "Musique" },
      { href: "/jeux", label: "Jeux" },
      { href: "/favorites", label: "Favoris" },
      { href: "/setup", label: "Setup" },
    ],
  },
];

// Public profiles already linked elsewhere on the site.
export const SOCIALS: { href: string; label: string; emoji: string }[] = [
  { href: "https://github.com/N3koNoTsuki", label: "GitHub", emoji: "🐙" },
  { href: "https://myanimelist.net/profile/NekoNoTsuki", label: "MyAnimeList", emoji: "🌸" },
  { href: "https://www.mangacollec.com/user/nekonotsuki/collection", label: "MangaCollec", emoji: "📚" },
];
