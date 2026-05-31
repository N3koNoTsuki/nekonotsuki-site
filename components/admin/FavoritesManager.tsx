"use client";

import { useState } from "react";
import Modal from "./Modal";
import MarkdownEditor from "./MarkdownEditor";
import ImageField from "./ImageField";
import { StarRating } from "@/components/ui";
import { api } from "@/lib/client";
import type { CategoryDTO, FavoriteDTO } from "@/lib/types";

type FavDraft = {
  id?: string;
  title: string;
  categoryId: string;
  imageUrl: string;
  description: string;
  comment: string;
  rating: number;
};

type CatDraft = { id?: string; name: string; icon: string };

export default function FavoritesManager({
  initialCategories,
  initialFavorites,
}: {
  initialCategories: CategoryDTO[];
  initialFavorites: FavoriteDTO[];
}) {
  const [categories, setCategories] = useState<CategoryDTO[]>(initialCategories);
  const [favorites, setFavorites] = useState<FavoriteDTO[]>(initialFavorites);
  const [favDraft, setFavDraft] = useState<FavDraft | null>(null);
  const [catDraft, setCatDraft] = useState<CatDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---- Categories ----
  async function saveCategory() {
    if (!catDraft) return;
    if (!catDraft.name.trim()) {
      setError("Nom de catégorie requis.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (catDraft.id) {
        const updated = await api.patch<CategoryDTO>(`/api/categories/${catDraft.id}`, {
          name: catDraft.name,
          icon: catDraft.icon,
        });
        setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const created = await api.post<CategoryDTO>("/api/categories", {
          name: catDraft.name,
          icon: catDraft.icon,
        });
        setCategories((prev) => [...prev, created]);
      }
      setCatDraft(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  async function removeCategory(id: string) {
    if (!confirm("Supprimer cette catégorie ET tous ses favoris ?")) return;
    await api.del(`/api/categories/${id}`);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setFavorites((prev) => prev.filter((f) => f.categoryId !== id));
  }

  // ---- Favorites ----
  async function saveFavorite() {
    if (!favDraft) return;
    if (!favDraft.title.trim() || !favDraft.categoryId) {
      setError("Titre et catégorie requis.");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      title: favDraft.title,
      categoryId: favDraft.categoryId,
      imageUrl: favDraft.imageUrl,
      description: favDraft.description,
      comment: favDraft.comment,
      rating: favDraft.rating,
    };
    try {
      if (favDraft.id) {
        const updated = await api.patch<FavoriteDTO>(`/api/favorites/${favDraft.id}`, payload);
        setFavorites((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      } else {
        const created = await api.post<FavoriteDTO>("/api/favorites", payload);
        setFavorites((prev) => [...prev, created]);
      }
      setFavDraft(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  async function removeFavorite(id: string) {
    if (!confirm("Supprimer ce favori ?")) return;
    await api.del(`/api/favorites/${id}`);
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }

  function newFavorite(categoryId: string) {
    setError(null);
    setFavDraft({ title: "", categoryId, imageUrl: "", description: "", comment: "", rating: 0 });
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-rose-deep">Favoris</h1>
        <button type="button" className="btn-secondary" onClick={() => { setError(null); setCatDraft({ name: "", icon: "✨" }); }}>
          + Catégorie
        </button>
      </div>

      {categories.length === 0 ? (
        <p className="kawaii-card p-6 text-ink/60">Crée d’abord une catégorie pour ranger tes favoris. ♡</p>
      ) : (
        <div className="space-y-8">
          {categories.map((cat) => {
            const items = favorites.filter((f) => f.categoryId === cat.id);
            return (
              <section key={cat.id}>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="font-display text-xl font-bold text-lavender-deep">
                    <span aria-hidden>{cat.icon}</span> {cat.name}{" "}
                    <span className="text-sm font-normal text-ink/40">({items.length})</span>
                  </h2>
                  <div className="flex gap-1">
                    <button type="button" className="btn-ghost text-xs" onClick={() => newFavorite(cat.id)}>
                      + Favori
                    </button>
                    <button
                      type="button"
                      className="btn-ghost text-xs"
                      onClick={() => { setError(null); setCatDraft({ id: cat.id, name: cat.name, icon: cat.icon ?? "" }); }}
                    >
                      Renommer
                    </button>
                    <button type="button" className="btn-danger text-xs" onClick={() => removeCategory(cat.id)}>
                      Suppr
                    </button>
                  </div>
                </div>

                {items.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-rose-soft/80 p-4 text-sm text-ink/40">
                    Aucun favori dans cette catégorie.
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {items.map((f) => (
                      <div key={f.id} className="kawaii-card flex gap-3 p-3">
                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl bg-kawaii-gradient">
                          {f.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={f.imageUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">{cat.icon ?? "♡"}</div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h3 className="truncate font-semibold">{f.title}</h3>
                            {f.rating ? <StarRating value={f.rating} className="text-sm" /> : null}
                          </div>
                          {f.comment && <p className="truncate text-xs italic text-rose-deep">“{f.comment}”</p>}
                          <div className="mt-1 flex gap-2">
                            <button
                              type="button"
                              className="btn-secondary text-xs"
                              onClick={() =>
                                setFavDraft({
                                  id: f.id,
                                  title: f.title,
                                  categoryId: f.categoryId,
                                  imageUrl: f.imageUrl ?? "",
                                  description: f.description ?? "",
                                  comment: f.comment ?? "",
                                  rating: f.rating ?? 0,
                                })
                              }
                            >
                              Éditer
                            </button>
                            <button type="button" className="btn-danger text-xs" onClick={() => removeFavorite(f.id)}>
                              Suppr
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* Category modal */}
      <Modal open={!!catDraft} onClose={() => setCatDraft(null)} title={catDraft?.id ? "Renommer la catégorie" : "Nouvelle catégorie"}>
        {catDraft && (
          <div className="space-y-4">
            <div className="grid grid-cols-[80px_1fr] gap-3">
              <div>
                <label className="label">Icône</label>
                <input className="input text-center" value={catDraft.icon} onChange={(e) => setCatDraft({ ...catDraft, icon: e.target.value })} placeholder="🎵" />
              </div>
              <div>
                <label className="label">Nom</label>
                <input className="input" value={catDraft.name} onChange={(e) => setCatDraft({ ...catDraft, name: e.target.value })} placeholder="Musique / Vocaloid" />
              </div>
            </div>
            {error && <p className="text-sm text-rose-deep">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={() => setCatDraft(null)}>
                Annuler
              </button>
              <button type="button" className="btn-primary" onClick={saveCategory} disabled={saving}>
                {saving ? "…" : "Enregistrer"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Favorite modal */}
      <Modal open={!!favDraft} onClose={() => setFavDraft(null)} title={favDraft?.id ? "Éditer le favori" : "Nouveau favori"}>
        {favDraft && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Titre</label>
                <input className="input" value={favDraft.title} onChange={(e) => setFavDraft({ ...favDraft, title: e.target.value })} />
              </div>
              <div>
                <label className="label">Catégorie</label>
                <select className="input" value={favDraft.categoryId} onChange={(e) => setFavDraft({ ...favDraft, categoryId: e.target.value })}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <ImageField value={favDraft.imageUrl} onChange={(imageUrl) => setFavDraft({ ...favDraft, imageUrl })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Note</label>
                <select className="input" value={favDraft.rating} onChange={(e) => setFavDraft({ ...favDraft, rating: Number(e.target.value) })}>
                  <option value={0}>Aucune</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {"♥".repeat(n)} ({n})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Commentaire perso (court)</label>
                <input className="input" value={favDraft.comment} onChange={(e) => setFavDraft({ ...favDraft, comment: e.target.value })} />
              </div>
            </div>
            <MarkdownEditor
              label="Description (Markdown)"
              value={favDraft.description}
              onChange={(description) => setFavDraft({ ...favDraft, description })}
              minRows={5}
            />
            {error && <p className="text-sm text-rose-deep">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={() => setFavDraft(null)}>
                Annuler
              </button>
              <button type="button" className="btn-primary" onClick={saveFavorite} disabled={saving}>
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
