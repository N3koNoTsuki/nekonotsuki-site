"use client";

import { useState } from "react";
import Modal from "./Modal";
import MarkdownEditor from "./MarkdownEditor";
import ImageField from "./ImageField";
import SortableList, { DragHandle } from "./Sortable";
import { api } from "@/lib/client";
import { parseTags } from "@/lib/utils";
import type { ProjectDTO } from "@/lib/types";

type Draft = {
  id?: string;
  title: string;
  coverUrl: string;
  description: string;
  tags: string;
  githubUrl: string;
  demoUrl: string;
  featured: boolean;
};

const empty: Draft = {
  title: "",
  coverUrl: "",
  description: "",
  tags: "",
  githubUrl: "",
  demoUrl: "",
  featured: false,
};

function toDraft(p: ProjectDTO): Draft {
  return {
    id: p.id,
    title: p.title,
    coverUrl: p.coverUrl ?? "",
    description: p.description ?? "",
    tags: p.tags ?? "",
    githubUrl: p.githubUrl ?? "",
    demoUrl: p.demoUrl ?? "",
    featured: p.featured,
  };
}

export default function ProjectsManager({ initial }: { initial: ProjectDTO[] }) {
  const [items, setItems] = useState<ProjectDTO[]>(initial);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!draft) return;
    if (!draft.title.trim()) {
      setError("Le titre est requis.");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      title: draft.title,
      coverUrl: draft.coverUrl,
      description: draft.description,
      tags: draft.tags,
      githubUrl: draft.githubUrl,
      demoUrl: draft.demoUrl,
      featured: draft.featured,
    };
    try {
      if (draft.id) {
        const updated = await api.patch<ProjectDTO>(`/api/projects/${draft.id}`, payload);
        setItems((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const created = await api.post<ProjectDTO>("/api/projects", payload);
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
    if (!confirm("Supprimer ce projet ?")) return;
    await api.del(`/api/projects/${id}`);
    setItems((prev) => prev.filter((p) => p.id !== id));
  }

  async function reorder(ids: string[]) {
    const prev = items;
    const map = new Map(items.map((p) => [p.id, p]));
    setItems(ids.map((id) => map.get(id)).filter((p): p is ProjectDTO => !!p));
    try {
      await api.put("/api/projects/reorder", { ids });
    } catch {
      setItems(prev);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-rose-deep">Projets</h1>
        <button type="button" className="btn-primary" onClick={() => setDraft({ ...empty })}>
          + Nouveau
        </button>
      </div>

      {items.length === 0 ? (
        <p className="kawaii-card p-6 text-ink/60">Aucun projet. Ajoute le premier ! ✨</p>
      ) : (
        <SortableList
          items={items}
          onReorder={reorder}
          grid
          className="grid gap-4 sm:grid-cols-2"
          renderItem={(p, handle) => (
            <div className="kawaii-card flex gap-3 p-4">
              <DragHandle handle={handle} />
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-kawaii-gradient">
                {p.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.coverUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">🌸</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-semibold">{p.title}</h3>
                  {p.featured && <span className="chip bg-rose-soft text-rose-deep">★</span>}
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {parseTags(p.tags).map((t) => (
                    <span key={t} className="chip bg-lavender-soft text-lavender-deep">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <button type="button" className="btn-secondary text-xs" onClick={() => setDraft(toDraft(p))}>
                    Éditer
                  </button>
                  <button type="button" className="btn-danger text-xs" onClick={() => remove(p.id)}>
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          )}
        />
      )}

      <Modal open={!!draft} onClose={() => setDraft(null)} title={draft?.id ? "Éditer le projet" : "Nouveau projet"}>
        {draft && (
          <div className="space-y-4">
            <div>
              <label className="label">Titre</label>
              <input className="input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </div>
            <ImageField label="Couverture" value={draft.coverUrl} onChange={(coverUrl) => setDraft({ ...draft, coverUrl })} />
            <MarkdownEditor
              label="Description (Markdown, courte)"
              value={draft.description}
              onChange={(description) => setDraft({ ...draft, description })}
              minRows={6}
            />
            <div>
              <label className="label">Tags (séparés par des virgules)</label>
              <input
                className="input"
                value={draft.tags}
                onChange={(e) => setDraft({ ...draft, tags: e.target.value })}
                placeholder="Next.js, TypeScript, Tailwind"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Lien GitHub</label>
                <input className="input" value={draft.githubUrl} onChange={(e) => setDraft({ ...draft, githubUrl: e.target.value })} placeholder="https://github.com/…" />
              </div>
              <div>
                <label className="label">Lien démo</label>
                <input className="input" value={draft.demoUrl} onChange={(e) => setDraft({ ...draft, demoUrl: e.target.value })} placeholder="https://…" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" className="accent-rose-deep" checked={draft.featured} onChange={(e) => setDraft({ ...draft, featured: e.target.checked })} />
              Coup de cœur (mis en avant)
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
