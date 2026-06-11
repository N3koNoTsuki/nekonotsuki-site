"use client";

import { useEffect, useState } from "react";

/** Floating "back to top" paw — appears once the page is scrolled past a screen. */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Revenir en haut"
      onClick={() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      }}
      className="fixed bottom-5 right-5 z-40 flex h-11 w-11 animate-fade-up items-center justify-center rounded-full border border-white/60 bg-cream/85 text-lg shadow-soft outline-none backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-glow focus-visible:ring-2 focus-visible:ring-rose-deep/60 dark:border-white/10 dark:bg-[#2c2533]/85"
    >
      <span aria-hidden>🐾</span>
    </button>
  );
}
