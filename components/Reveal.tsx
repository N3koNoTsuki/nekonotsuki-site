import { cn } from "@/lib/utils";

/**
 * Entrance animation that is safe without JavaScript: it uses a pure CSS
 * keyframe (`animate-fade-up`) with `both` fill, so the content always ends
 * up visible even if scripts never run. `prefers-reduced-motion` is honored
 * in globals.css.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}) {
  return (
    <Tag
      className={cn("animate-fade-up", className)}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
