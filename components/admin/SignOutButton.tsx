"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="btn-ghost w-full justify-start text-sm">
      ↩ Déconnexion
    </button>
  );
}
