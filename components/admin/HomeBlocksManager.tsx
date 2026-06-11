"use client";

import { useState } from "react";
import Modal from "./Modal";
import MarkdownEditor from "./MarkdownEditor";
import SortableList, { DragHandle } from "./Sortable";
import { api } from "@/lib/client";
import { cn } from "@/lib/utils";
import type { BlockDTO } from "@/lib/types";

type BlockType = {
  value: string;
  label: string;
  icon: string;
  hasContent: boolean;
  hasCount: boolean;
};

const TYPES: BlockType[] = [
  { value: "intro", label: "Présentation (intro)", icon: "👋", hasContent: true, hasCount: false },
  { value: "latest-projects", label: "Derniers projets", icon: "✨", hasContent: false, hasCount: true },
  { value: "latest-favorites", label: "Derniers favoris", icon: "♡", hasContent: false, hasCount: true },
  { value: "latest-timeline", label: "Dernière étape parcours", icon: "🌿", hasContent: false, hasCount: true },
  { value: "custom", label: "Bloc libre (Markdown)", icon: "📝", hasContent: true, hasCount: false },
];

function typeMeta(type: string): BlockType {
  return TYPES.find((t) => t.value === type) ?? { value: type, label: type, icon: "🧩", hasContent: false, hasCount: false };
}

type Draft = {
  id?: string;
  type: string;
  title: string;
  content: string;
  count: number;
  visible: boolean;
};

const empty: Draft = { type: "custom", title: "", content: "", count: 3, visible: true };

function parseCount(config: string | null, fallback = 3) {
  if (!config) return fallback;
  try {
    const v = JSON.parse(config)?.count;
    return typeof v === "number" ? v : fallback;
  } catch {
    return fallback;
  }
}

export default function HomeBlocksManager({ initial }: { initial: BlockDTO[] }) {
  const [items, setItems] = useState<BlockDTO[]>(initial);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const meta = draft ? typeMeta(draft.type) : null;

  async function save() {
    if (!draft) return;
    setSaving(true);
    setError(null);
    const m = typeMeta(draft.type);
    const payload = {
      type: draft.type,
      title: draft.title,
      content: m.hasContent ? draft.content : undefined,
      config: m.hasCount ? JSON.stringify({ count: draft.count }) : undefined,
      visible: draft.visible,
    };
    try {
      if (draft.id) {
        const updated = await api.patch<BlockDTO>(`/api/blocks/${draft.id}`, payload);
        setItems((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      } else {
        const created = await api.post<BlockDTO>("/api/blocks", payload);
        setItems((prev) => [...prev, created]);
      }
      setDraft(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Supprimer ce bloc ?")) return;
    await api.del(`/api/blocks/${id}`);
    setItems((prev) => prev.filter((b) => b.id !== id));
  }

  async function toggleVisible(block: BlockDTO) {
    const next = !block.visible;
    setItems((prev) => prev.map((b) => (b.id === block.id ? { ...b, visible: next } : b)));
    try {
      await api.patch(`/api/blocks/${block.id}`, { visible: next });
    } catch {
      setItems((prev) => prev.map((b) => (b.id === block.id ? { ...b, visible: block.visible } : b)));
    }
  }

  async function reorder(ids: string[]) {
    const map = new Map(items.map((b) => [b.id, b]));
    setItems(ids.map((id) => map.get(id)!).filter(Boolean));
    try {
      await api.put("/api/blocks/reorder", { ids });
    } catch {
      setItems(initial);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-rose-deep">Blocs de l’accueil</h1>
        <button type="button" className="btn-primary" onClick={() => setDraft({ ...empty })}>
          + Nouveau bloc
        </button>
      </div>
      <p className="mb-4 text-sm text-ink/60 dark:text-nightink/60">
        Glisse-dépose <span className="font-semibold">⠿</span> pour réordonner. L’œil masque/affiche un bloc sur le site.
      </p>

      {items.length === 0 ? (
        <p className="kawaii-card p-6 text-ink/60">Aucun bloc. Ajoute-en un ! 🧩</p>
      ) : (
        <SortableList
          items={items}
          onReorder={reorder}
          renderItem={(block, handle) => {
            const m = typeMeta(block.type);
            return (
              <div className={cn("kawaii-card flex items-center gap-2 p-3", !block.visible && "opacity-50")}>
                <DragHandle handle={handle} />
                <span className="text-xl" aria-hidden>
                  {m.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">{block.title || m.label}</h3>
                  <span className="text-xs text-ink/50 dark:text-nightink/50">{m.label}</span>
                </div>
                <button
                  type="button"
                  className="btn-ghost text-lg"
                  title={block.visible ? "Masquer" : "Afficher"}
                  onClick={() => toggleVisible(block)}
                >
                  {block.visible ? "👁" : "🙈"}
                </button>
                <button
                  type="button"
                  className="btn-secondary text-xs"
                  onClick={() =>
                    setDraft({
                      id: block.id,
                      type: block.type,
                      title: block.title ?? "",
                      content: block.content ?? "",
                      count: parseCount(block.config),
                      visible: block.visible,
                    })
                  }
                >
                  Éditer
                </button>
                <button type="button" className="btn-danger text-xs" onClick={() => remove(block.id)}>
                  Suppr
                </button>
              </div>
            );
          }}
        />
      )}

      <Modal open={!!draft} onClose={() => setDraft(null)} title={draft?.id ? "Éditer le bloc" : "Nouveau bloc"}>
        {draft && meta && (
          <div className="space-y-4">
            <div>
              <label className="label">Type de bloc</label>
              <select
                className="input"
                value={draft.type}
                onChange={(e) => setDraft({ ...draft, type: e.target.value })}
                disabled={!!draft.id}
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.icon} {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Titre (optionnel)</label>
              <input className="input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </div>

            {meta.hasContent && (
              <MarkdownEditor
                label="Contenu (Markdown)"
                value={draft.content}
                onChange={(content) => setDraft({ ...draft, content })}
                minRows={6}
              />
            )}

            {meta.hasCount && (
              <div>
                <label className="label">Nombre d’éléments à afficher</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  className="input"
                  value={draft.count}
                  onChange={(e) => setDraft({ ...draft, count: Number(e.target.value) })}
                />
              </div>
            )}

            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" className="accent-rose-deep" checked={draft.visible} onChange={(e) => setDraft({ ...draft, visible: e.target.checked })} />
              Visible sur le site
            </label>

            {error && <p className="text-sm text-rose-deep">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={() => setDraft(null)}>
                Annuler
              </button>
              <button type="button" className="btn-primary" onClick={save} disabled={saving}>
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
