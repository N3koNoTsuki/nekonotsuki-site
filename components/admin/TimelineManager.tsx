"use client";

import { useState } from "react";
import Modal from "./Modal";
import MarkdownEditor from "./MarkdownEditor";
import SortableList, { DragHandle } from "./Sortable";
import { api } from "@/lib/client";
import { formatMonthYear, tagMeta } from "@/lib/utils";
import type { TimelineDTO } from "@/lib/types";

const TAGS = [
  { value: "etudes", label: "Études" },
  { value: "pro", label: "Pro" },
  { value: "perso", label: "Perso" },
  { value: "projet", label: "Projet" },
];

type Draft = {
  id?: string;
  title: string;
  date: string;
  tag: string;
  description: string;
};

const empty: Draft = { title: "", date: new Date().toISOString().slice(0, 10), tag: "perso", description: "" };

export default function TimelineManager({ initial }: { initial: TimelineDTO[] }) {
  const [items, setItems] = useState<TimelineDTO[]>(initial);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!draft) return;
    if (!draft.title.trim() || !draft.date) {
      setError("Titre et date requis.");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = { title: draft.title, date: draft.date, tag: draft.tag, description: draft.description };
    try {
      if (draft.id) {
        const updated = await api.patch<TimelineDTO>(`/api/timeline/${draft.id}`, payload);
        setItems((prev) => prev.map((i) => (i.id === updated.id ? { ...updated, date: updated.date } : i)));
      } else {
        const created = await api.post<TimelineDTO>("/api/timeline", payload);
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
    if (!confirm("Supprimer cette étape ?")) return;
    await api.del(`/api/timeline/${id}`);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function reorder(ids: string[]) {
    const map = new Map(items.map((i) => [i.id, i]));
    setItems(ids.map((id) => map.get(id)!).filter(Boolean));
    try {
      await api.put("/api/timeline/reorder", { ids });
    } catch {
      // revert on failure
      setItems(initial);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-rose-deep">Parcours</h1>
        <button type="button" className="btn-primary" onClick={() => setDraft({ ...empty })}>
          + Nouvelle étape
        </button>
      </div>
      <p className="mb-4 text-sm text-ink/60 dark:text-[#efe6ee]/60">
        Glisse-dépose <span className="font-semibold">⠿</span> pour réordonner les étapes.
      </p>

      {items.length === 0 ? (
        <p className="kawaii-card p-6 text-ink/60">Aucune étape pour l’instant.</p>
      ) : (
        <SortableList
          items={items}
          onReorder={reorder}
          renderItem={(entry, handle) => {
            const meta = tagMeta(entry.tag);
            return (
              <div className="kawaii-card flex items-center gap-2 p-3">
                <DragHandle handle={handle} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <time className="text-sm font-semibold text-lavender-deep">{formatMonthYear(entry.date)}</time>
                    <span className={`chip ${meta.className}`}>{meta.label}</span>
                  </div>
                  <h3 className="truncate font-semibold">{entry.title}</h3>
                </div>
                <button
                  type="button"
                  className="btn-secondary text-xs"
                  onClick={() =>
                    setDraft({
                      id: entry.id,
                      title: entry.title,
                      date: entry.date.slice(0, 10),
                      tag: entry.tag,
                      description: entry.description ?? "",
                    })
                  }
                >
                  Éditer
                </button>
                <button type="button" className="btn-danger text-xs" onClick={() => remove(entry.id)}>
                  Suppr
                </button>
              </div>
            );
          }}
        />
      )}

      <Modal open={!!draft} onClose={() => setDraft(null)} title={draft?.id ? "Éditer l’étape" : "Nouvelle étape"}>
        {draft && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Date</label>
                <input type="date" className="input" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
              </div>
              <div>
                <label className="label">Catégorie</label>
                <select className="input" value={draft.tag} onChange={(e) => setDraft({ ...draft, tag: e.target.value })}>
                  {TAGS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Titre</label>
              <input className="input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </div>
            <MarkdownEditor
              label="Description (Markdown)"
              value={draft.description}
              onChange={(description) => setDraft({ ...draft, description })}
              minRows={6}
            />
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
