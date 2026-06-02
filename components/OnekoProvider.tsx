"use client";

import { createContext, useContext, useEffect, useState } from "react";

type OnekoContextValue = {
  /** Whether the cat should run. */
  enabled: boolean;
  /** Flip the cat on/off (persisted to localStorage). */
  toggle: () => void;
  /** True once the stored preference has been read (avoids a first-paint flicker). */
  ready: boolean;
};

const OnekoContext = createContext<OnekoContextValue | null>(null);

/**
 * Shares the oneko on/off state between the toggle button (in the Navbar) and
 * the cat itself (in the layout). The preference is stored in localStorage;
 * the cat is on by default.
 */
export default function OnekoProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("oneko");
      if (stored !== null) setEnabled(stored !== "off");
    } catch {}
    setReady(true);
  }, []);

  function toggle() {
    setEnabled((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem("oneko", next ? "on" : "off");
      } catch {}
      return next;
    });
  }

  return <OnekoContext.Provider value={{ enabled, toggle, ready }}>{children}</OnekoContext.Provider>;
}

export function useOneko(): OnekoContextValue {
  const ctx = useContext(OnekoContext);
  if (!ctx) throw new Error("useOneko must be used within <OnekoProvider>");
  return ctx;
}
