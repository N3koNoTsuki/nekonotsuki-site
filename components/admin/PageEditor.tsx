"use client";

import { useState } from "react";
import MarkdownEditor from "./MarkdownEditor";
import { api } from "@/lib/client";

export default function PageEditor({
  slug,
  initialTitle,
  initialContent,
}: {
  slug: string;
  initialTitle: string;
  initialContent: string;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  async function save() {
    setSaving(true);
    setStatus(null);
    try {
      await api.put(`/api/pages/${slug}`, { title, content });
      setStatus({ type: "ok", msg: "Enregistré ! ✿" });
    } catch (e) {
      setStatus({ type: "err", msg: e instanceof Error ? e.message : "Erreur" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="label" htmlFor="page-title">
          Titre de la page
        </label>
        <input id="page-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <MarkdownEditor label="Contenu (Markdown)" value={content} onChange={setContent} minRows={18} />

      <div className="flex items-center gap-3">
        <button type="button" className="btn-primary" onClick={save} disabled={saving}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
        {status && (
          <span className={status.type === "ok" ? "text-sm font-semibold text-mint" : "text-sm font-semibold text-rose-deep"}>
            {status.msg}
          </span>
        )}
      </div>
    </div>
  );
}
