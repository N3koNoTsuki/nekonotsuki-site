"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  // Focus the panel ONCE when it opens (and scroll it into view). Kept separate
  // from the effect above so it doesn't re-run on every render and steal focus
  // from the field being typed in.
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  if (!open || !mounted) return null;

  // Portal to <body> so transformed / backdrop-blur ancestors don't capture the
  // fixed positioning (which previously pinned the modal inside .glass).
  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-ink/40 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="my-8 w-full max-w-2xl rounded-3xl border border-white/60 bg-cream p-6 shadow-glass outline-none dark:border-white/10 dark:bg-nightcard"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-rose-deep">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Fermer" className="btn-ghost h-9 w-9 !px-0 text-lg">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
