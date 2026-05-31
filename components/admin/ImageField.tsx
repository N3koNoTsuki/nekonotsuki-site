"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/lib/client";

/**
 * Image picker with two paths (per spec): local upload to /public/uploads,
 * or an external URL fallback. Stores the resulting URL string.
 */
export default function ImageField({
  value,
  onChange,
  label = "Image",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l’upload");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex flex-wrap items-start gap-3">
        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-kawaii-gradient">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="aperçu" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl" aria-hidden>
              🖼
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://… ou /uploads/…"
            className="input"
          />
          <div className="flex items-center gap-2">
            <button type="button" className="btn-secondary text-sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
              {uploading ? "Envoi…" : "⬆ Uploader"}
            </button>
            {value && (
              <button type="button" className="btn-ghost text-sm" onClick={() => onChange("")}>
                Retirer
              </button>
            )}
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
          </div>
          {error && <p className="text-sm text-rose-deep">{error}</p>}
        </div>
      </div>
    </div>
  );
}
