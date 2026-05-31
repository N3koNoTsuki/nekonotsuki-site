import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center bg-kawaii-radial bg-fixed px-4 dark:bg-kawaii-radial-dark">
      <div className="glass w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <div className="mb-2 text-4xl animate-float" aria-hidden>
            🔐
          </div>
          <h1 className="font-display text-3xl font-bold text-rose-deep">Espace admin</h1>
          <p className="mt-1 text-sm text-ink/60 dark:text-[#efe6ee]/60">Connecte-toi pour gérer ton site</p>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-lavender-deep hover:underline">
            ← Retour au site
          </Link>
        </p>
      </div>
    </main>
  );
}
