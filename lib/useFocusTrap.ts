"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, video[controls], [tabindex]:not([tabindex="-1"])';

/**
 * Keeps Tab / Shift+Tab cycling inside `ref` while `active` — for the modal
 * lightboxes (they already handle Escape, backdrop click and initial focus;
 * this closes the last gap: tabbing out into the page behind the dialog).
 */
export function useFocusTrap(ref: RefObject<HTMLElement>, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const el = ref.current;
      if (!el) return;
      const focusables = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (f) => f.offsetParent !== null || f === document.activeElement,
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const current = document.activeElement;
      if (e.shiftKey) {
        if (current === first || !el.contains(current)) {
          e.preventDefault();
          last.focus();
        }
      } else if (current === last || !el.contains(current)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [ref, active]);
}
