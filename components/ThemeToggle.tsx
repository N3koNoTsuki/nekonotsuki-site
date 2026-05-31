"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  }

  // Avoid hydration mismatch: render a neutral placeholder until mounted.
  if (!mounted) {
    return <span aria-hidden className="h-9 w-9 rounded-full" />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Activer le thème clair" : "Activer le thème sombre"}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/60 text-lg shadow-soft transition hover:scale-110 dark:bg-white/10"
    >
      {dark ? "🌙" : "🌸"}
    </button>
  );
}
