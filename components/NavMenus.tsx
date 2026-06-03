"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import NavLink from "./NavLink";

type Item = { href: string; label: string };

/** Desktop "Plus" dropdown — state-driven so it closes after a selection. */
export function MoreMenu({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const ref = useRef<HTMLLIElement>(null);

  // Close after navigating.
  useEffect(() => setOpen(false), [pathname]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <li className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-2xl px-3 py-2 text-sm font-semibold text-ink/70 transition hover:bg-white/60 hover:text-ink dark:text-[#efe6ee]/70 dark:hover:bg-white/10 dark:hover:text-[#efe6ee]"
      >
        Plus
        <span aria-hidden className="text-[0.6rem]">
          ▾
        </span>
      </button>
      {open && (
        <ul className="absolute right-0 top-full z-50 mt-1 flex w-44 flex-col gap-1 rounded-3xl border border-white/50 bg-cream/95 p-2 shadow-soft backdrop-blur-md dark:border-white/10 dark:bg-[#2c2533]/95">
          {items.map((l) => (
            <li key={l.href}>
              <NavLink href={l.href} label={l.label} block onClick={() => setOpen(false)} />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/** Mobile burger menu — same close-on-navigation behaviour. */
export function MobileMenu({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative md:hidden" ref={ref}>
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/60 dark:bg-white/10"
      >
        {open ? "✕" : "☰"}
      </button>
      {open && (
        <ul className="absolute right-0 mt-2 flex w-44 flex-col gap-1 rounded-3xl border border-white/50 bg-cream/95 p-2 shadow-soft backdrop-blur-md dark:border-white/10 dark:bg-[#2c2533]/95">
          {items.map((l) => (
            <li key={l.href}>
              <NavLink href={l.href} label={l.label} block onClick={() => setOpen(false)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
