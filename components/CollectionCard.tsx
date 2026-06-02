/**
 * Poster card for the Collection page (anime / manga). Cover + title that links
 * out (e.g. to MyAnimeList). Pure/presentational server component.
 */
export default function CollectionCard({
  title,
  href,
  imageUrl,
  subtitle,
  fallback = "🌸",
}: {
  title: string;
  href: string;
  imageUrl: string | null;
  subtitle?: string | null;
  fallback?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="kawaii-card group block overflow-hidden transition hover:-translate-y-1"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-kawaii-gradient">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl" aria-hidden>
            {fallback}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-bold text-ink dark:text-[#efe6ee]">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-ink/50 dark:text-[#efe6ee]/50">{subtitle}</p>}
      </div>
    </a>
  );
}
