import { NextResponse } from "next/server";

// JSON response helpers for the local /edit write API (dev only). No auth:
// these routes are excluded from the production static build entirely.

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status: 400 });
}

export function notFound(message = "Introuvable") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}
