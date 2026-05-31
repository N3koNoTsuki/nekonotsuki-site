import { NextResponse } from "next/server";
import { auth } from "@/auth";

/** Guard for mutating route handlers. Returns the session or a 401 response. */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    return {
      session: null,
      error: NextResponse.json({ error: "Non autorisé" }, { status: 401 }),
    };
  }
  return { session, error: null as null };
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status: 400 });
}

export function notFound(message = "Introuvable") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}
