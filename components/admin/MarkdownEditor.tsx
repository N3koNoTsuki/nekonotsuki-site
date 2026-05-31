"use client";

import { useRef, useState } from "react";
import Markdown from "@/components/Markdown";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  minRows?: number;
  id?: string;
};

type Tool = {
  label: string;
  title: string;
  /** Wrap selection or insert at cursor. */
  apply: (sel: string) => { text: string; selectInner?: boolean };
  block?: boolean;
};

const TOOLS: Tool[] = [
  { label: "B", title: "Gras", apply: (s) => ({ text: `**${s || "texte"}**`, selectInner: !s }) },
  { label: "i", title: "Italique", apply: (s) => ({ text: `*${s || "texte"}*`, selectInner: !s }) },
  { label: "H2", title: "Titre", block: true, apply: (s) => ({ text: `## ${s || "Titre"}`, selectInner: !s }) },
  { label: "•", title: "Liste", block: true, apply: (s) => ({ text: `- ${s || "élément"}`, selectInner: !s }) },
  { label: "1.", title: "Liste ordonnée", block: true, apply: (s) => ({ text: `1. ${s || "élément"}`, selectInner: !s }) },
  { label: "</>", title: "Code", apply: (s) => ({ text: "`" + (s || "code") + "`", selectInner: !s }) },
  { label: "{ }", title: "Bloc de code", block: true, apply: (s) => ({ text: "```\n" + (s || "code") + "\n```", selectInner: !s }) },
  { label: "🔗", title: "Lien", apply: (s) => ({ text: `[${s || "texte"}](https://)`, selectInner: false }) },
  { label: "🖼", title: "Image", apply: (s) => ({ text: `![${s || "alt"}](https://)`, selectInner: false }) },
  { label: "”", title: "Citation", block: true, apply: (s) => ({ text: `> ${s || "citation"}`, selectInner: !s }) },
  {
    label: "▦",
    title: "Tableau",
    block: true,
    apply: () => ({ text: "| Col A | Col B |\n| ----- | ----- |\n| a | b |", selectInner: false }),
  },
];

export default function MarkdownEditor({ value, onChange, label, placeholder, minRows = 12, id }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [tab, setTab] = useState<"edit" | "preview">("edit"); // mobile tab switch

  function runTool(tool: Tool) {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end);
    const { text } = tool.apply(selected);

    const before = value.slice(0, start);
    const after = value.slice(end);
    const needsNL = tool.block && before.length > 0 && !before.endsWith("\n\n");
    const prefix = needsNL ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
    const next = before + prefix + text + after;
    onChange(next);

    requestAnimationFrame(() => {
      ta.focus();
      const pos = (before + prefix + text).length;
      ta.setSelectionRange(pos, pos);
    });
  }

  return (
    <div>
      {label && <span className="label">{label}</span>}
      <div className="overflow-hidden rounded-2xl border border-rose-soft/80 dark:border-white/10">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 border-b border-rose-soft/60 bg-rose-soft/30 p-1.5 dark:border-white/10 dark:bg-white/5">
          {TOOLS.map((t) => (
            <button
              key={t.title}
              type="button"
              title={t.title}
              onClick={() => runTool(t)}
              className="rounded-lg px-2 py-1 text-sm font-semibold text-ink/70 transition hover:bg-white hover:text-rose-deep dark:text-[#efe6ee]/70 dark:hover:bg-white/10"
            >
              {t.label}
            </button>
          ))}
          {/* Mobile tab toggle */}
          <div className="ml-auto flex gap-1 md:hidden">
            <button
              type="button"
              onClick={() => setTab("edit")}
              className={cn("rounded-lg px-2 py-1 text-xs font-semibold", tab === "edit" ? "bg-white text-rose-deep" : "text-ink/60")}
            >
              Éditer
            </button>
            <button
              type="button"
              onClick={() => setTab("preview")}
              className={cn("rounded-lg px-2 py-1 text-xs font-semibold", tab === "preview" ? "bg-white text-rose-deep" : "text-ink/60")}
            >
              Aperçu
            </button>
          </div>
        </div>

        {/* Split pane */}
        <div className="grid md:grid-cols-2">
          <textarea
            id={id}
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder ?? "Écris en Markdown…"}
            rows={minRows}
            spellCheck
            className={cn(
              "resize-y border-0 bg-white/80 p-4 font-mono text-sm text-ink outline-none focus:ring-0 dark:bg-transparent dark:text-[#efe6ee] md:border-r md:border-rose-soft/60 dark:md:border-white/10",
              tab === "preview" && "hidden md:block",
            )}
          />
          <div
            className={cn(
              "overflow-auto bg-white/40 p-4 dark:bg-white/[0.03]",
              tab === "edit" && "hidden md:block",
            )}
            aria-live="polite"
          >
            {value.trim() ? (
              <Markdown>{value}</Markdown>
            ) : (
              <p className="text-sm italic text-ink/40">L’aperçu s’affiche ici…</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
