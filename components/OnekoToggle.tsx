"use client";

import { useEffect, useState } from "react";
import { useOneko } from "./OnekoProvider";
import { cn } from "@/lib/utils";

/**
 * Button (next to the theme toggle) to show/hide the oneko cat. Hidden on touch
 * devices, where there is no cursor for the cat to chase.
 */
export default function OnekoToggle() {
  const { enabled, toggle } = useOneko();
  const [mounted, setMounted] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  // Neutral placeholder until mounted (avoids a hydration mismatch), then hide
  // entirely on touch devices.
  if (!mounted) return <span aria-hidden className="h-9 w-9 rounded-full" />;
  if (isTouch) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? "Cacher le chat" : "Afficher le chat"}
      title={enabled ? "Cacher le chat" : "Afficher le chat"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-white/60 text-lg shadow-soft transition hover:scale-110 dark:bg-white/10",
        !enabled && "opacity-40 grayscale",
      )}
    >
      🐱
    </button>
  );
}
