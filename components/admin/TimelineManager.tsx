"use client";

import { useState } from "react";
import Modal from "./Modal";
import MarkdownEditor from "./MarkdownEditor";
import { api } from "@/lib/client";
import { formatDateRange, tagMeta } from "@/lib/utils";
import type { TimelineDTO } from "@/lib/types";

// Built-in categories suggested in the datalist (value = stored slug, label = shown).
const DEFAULT_TAGS = [
  { value: "etudes", label: "Études" },
  { value: "pro", label: "Pro" },
  { value: "perso", label: "Perso" },
  { value: "projet", label: "Projet" },
];

type Draft = {
  id?: string;
  title: string;
  date: string;
  endDate: string;
  tag: string;
  description: string;
};

const empty: Draft = {
  title: "",
  date: new Date().toISOString().slice(0, 10),
  endDate: "",
  tag: "perso",
  description: "",
};

// Most recent first.
function sortByDate(list: TimelineDTO[]): TimelineDTO[] {
  return [...list].sort((a, b) => b.date.localeCompare(a.date));
}

export default function TimelineManager({ initial }: { initial: TimelineDTO[] }) {
  const [items, setItems] = useState<TimelineDTO[]>(() => sortByDate(initial));
  const [draft, setDraft] = useState<Draft | null>(null);
  const [newTag, setNewTag] = useState(false); // "create a new category" mode
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // All selectable categories: built-in defaults + any custom ones already used.
  const customTags = Array.from(new Set(items.map((i) => i.tag))).filter(
    (t) => !DEFAULT_TAGS.some((d) => d.value === t),
  );
  const allTags = [...DEFAULT_TAGS, ...customTags.map((t) => ({ value: t, label: tagMeta(t).label }))];

  function openDraft(d: Draft) {
    setError(null);
    setNewTag(false);
    setDraft(d);
  }

  async function save() {
    if (!draft) return;
    if (!draft.title.trim() || !draft.date) {
      setError("Titre et date requis.");
      return;
    }
    if (!draft.tag.trim()) {
      setError("Catégorie requise.");
      return;
    }
    if (draft.endDate && draft.endDate < draft.date) {
      setError("La date de fin doit être après la date de début.");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      title: draft.title,
      date: draft.date,
      endDate: draft.endDate,
      tag: draft.tag.trim(),
      description: draft.description,
    };
    try {
      if (draft.id) {
        const updated = await api.patch<TimelineDTO>(`/api/timeline/${draft.id}`, payload);
        setItems((prev) => sortByDate(prev.map((i) => (i.id === updated.id ? updated : i))));
      } else {
        const created = await api.post<TimelineDTO>("/api/timeline", payload);
        setItems((prev) => sortByDate([...prev, created]));
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

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-rose-deep">Parcours</h1>
        <button type="button" className="btn-primary" onClick={() => openDraft({ ...empty })}>
          + Nouvelle étape
        </button>
      </div>
      <p className="mb-4 text-sm text-ink/60 dark:text-[#efe6ee]/60">
        Les étapes se rangent automatiquement par date (plus récentes en haut). Tu peux ajouter une date de fin
        et créer tes propres catégories.
      </p>

      {items.length === 0 ? (
        <p className="kawaii-card p-6 text-ink/60">Aucune étape pour l’instant.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((entry) => {
            const meta = tagMeta(entry.tag);
            return (
              <li key={entry.id} className="kawaii-card flex items-center gap-2 p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <time className="text-sm font-semibold text-lavender-deep">
                      {formatDateRange(entry.date, entry.endDate)}
                    </time>
                    <span className={`chip ${meta.className}`}>{meta.label}</span>
                  </div>
                  <h3 className="truncate font-semibold">{entry.title}</h3>
                </div>
                <button
                  type="button"
                  className="btn-secondary text-xs"
                  onClick={() =>
                    openDraft({
                      id: entry.id,
                      title: entry.title,
                      date: entry.date.slice(0, 10),
                      endDate: entry.endDate ? entry.endDate.slice(0, 10) : "",
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
              </li>
            );
          })}
        </ul>
      )}

      <Modal open={!!draft} onClose={() => setDraft(null)} title={draft?.id ? "Éditer l’étape" : "Nouvelle étape"}>
        {draft && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Date de début</label>
                <input type="date" className="input" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
              </div>
              <div>
                <label className="label">Date de fin (optionnelle)</label>
                <input
                  type="date"
                  className="input"
                  value={draft.endDate}
                  min={draft.date}
                  onChange={(e) => setDraft({ ...draft, endDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="label">Catégorie</label>
              <select
                className="input"
                value={newTag ? "__new__" : draft.tag}
                onChange={(e) => {
                  if (e.target.value === "__new__") {
                    setNewTag(true);
                    setDraft({ ...draft, tag: "" });
                  } else {
                    setNewTag(false);
                    setDraft({ ...draft, tag: e.target.value });
                  }
                }}
              >
                {allTags.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
                <option value="__new__">➕ Nouvelle catégorie…</option>
              </select>
              {newTag && (
                <input
                  className="input mt-2"
                  autoFocus
                  value={draft.tag}
                  onChange={(e) => setDraft({ ...draft, tag: e.target.value })}
                  placeholder="Nom de la nouvelle catégorie (ex. Voyages)"
                />
              )}
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
