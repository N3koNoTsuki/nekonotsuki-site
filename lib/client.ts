// Tiny client-side fetch helpers for the admin API calls.

async function request<T>(url: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let message = `Erreur ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {}
    throw new Error(message);
  }
  // DELETE may return empty-ish JSON; guard parse.
  try {
    return (await res.json()) as T;
  } catch {
    return undefined as T;
  }
}

export const api = {
  post: <T>(url: string, body: unknown) => request<T>(url, "POST", body),
  patch: <T>(url: string, body: unknown) => request<T>(url, "PATCH", body),
  put: <T>(url: string, body: unknown) => request<T>(url, "PUT", body),
  del: <T>(url: string) => request<T>(url, "DELETE"),
};

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || "Échec de l’upload");
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}
