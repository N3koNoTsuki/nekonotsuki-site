// GitHub-style programming-language colours (a curated subset of
// github-linguist's languages.yml) plus helpers that turn a `{ lang: bytes }`
// map — the shape returned by the GitHub API — into sorted percentages.

export type LangStat = { name: string; bytes: number; pct: number };

const LANGUAGE_COLORS: Record<string, string> = {
  Rust: "#dea584",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  VHDL: "#adb2cb",
  Verilog: "#b2b7f8",
  SystemVerilog: "#dae1c2",
  Makefile: "#427819",
  CMake: "#da3434",
  Assembly: "#6e4c13",
  "Linker Script": "#185619",
  Shell: "#89e051",
  Python: "#3572a5",
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Go: "#00add8",
  Java: "#b07219",
  Kotlin: "#a97bff",
  Swift: "#f05138",
  Ruby: "#701516",
  PHP: "#4f5d95",
  Lua: "#000080",
  Dockerfile: "#384d54",
  Tcl: "#e4cc98",
  TeX: "#3d6117",
  Vue: "#41b883",
  Markdown: "#083fa1",
};

// Soft lavender for any language we don't have an explicit colour for.
const FALLBACK_COLOR = "#c3b6d8";

export function langColor(name: string): string {
  return LANGUAGE_COLORS[name] ?? FALLBACK_COLOR;
}

/** `{ Rust: 24991, C: 6369 }` → `[{ name, bytes, pct }, …]` sorted desc. */
export function toLangStats(bytesByLang: Record<string, number>): LangStat[] {
  const total = Object.values(bytesByLang).reduce((sum, n) => sum + n, 0);
  if (total <= 0) return [];
  return Object.entries(bytesByLang)
    .map(([name, bytes]) => ({ name, bytes, pct: (bytes / total) * 100 }))
    .sort((a, b) => b.bytes - a.bytes);
}

/** Merge several `{ lang: bytes }` maps into one (for the site-wide total). */
export function mergeLangBytes(
  maps: Array<Record<string, number> | null | undefined>,
): Record<string, number> {
  const merged: Record<string, number> = {};
  for (const map of maps) {
    if (!map) continue;
    for (const [lang, bytes] of Object.entries(map)) {
      merged[lang] = (merged[lang] ?? 0) + bytes;
    }
  }
  return merged;
}
