import { cn } from "@/lib/utils";

/** Read-only star rating (0–5). */
export function StarRating({ value, className }: { value: number; className?: string }) {
  const full = Math.max(0, Math.min(5, value));
  return (
    <span className={cn("inline-flex items-center text-base leading-none", className)} aria-label={`Note : ${full} sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < full ? "text-rose-deep" : "text-rose-soft/60"}>
          ♥
        </span>
      ))}
    </span>
  );
}

/** Filter / category chip. */
export function TagChip({
  children,
  active = false,
  className,
}: {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "chip transition",
        active
          ? "bg-rose-deep text-white shadow-soft"
          : "bg-lavender-soft text-lavender-deep hover:bg-lavender",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Page header with kawaii flourish. */
export function PageHeader({
  emoji,
  title,
  subtitle,
}: {
  emoji?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-8 text-center">
      <h1 className="font-display text-4xl font-bold text-rose-deep md:text-5xl">
        {emoji && (
          <span className="mr-2 inline-block animate-float" aria-hidden>
            {emoji}
          </span>
        )}
        {title}
      </h1>
      {subtitle && <p className="mt-2 text-ink/60 dark:text-nightink/60">{subtitle}</p>}
    </header>
  );
}

/** Friendly empty state. */
export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="kawaii-card mx-auto max-w-md px-6 py-10 text-center text-ink/60 dark:text-nightink/60">
      <div className="mb-2 text-4xl" aria-hidden>
        🍰
      </div>
      {children}
    </div>
  );
}
