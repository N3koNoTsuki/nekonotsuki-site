import Link from "next/link";

// Brand-styled 404 — rendered standalone (outside the (public) layout group),
// so it carries its own kawaii backdrop.
export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-kawaii-radial dark:bg-kawaii-radial-dark"
        aria-hidden
      />
      <main className="glass w-full max-w-md p-8 text-center md:p-10">
        <div className="animate-float text-6xl" aria-hidden>
          🙀
        </div>
        <h1 className="mt-3 font-display text-5xl font-bold text-rose-deep">404</h1>
        <p className="mt-3 text-ink/70 dark:text-[#efe6ee]/70">
          Oups… cette page s’est perdue comme un chat dans un carton.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">
            🏠 Retour à l’accueil
          </Link>
          <Link href="/projects" className="btn-secondary">
            ✨ Mes projets
          </Link>
        </div>
      </main>
    </div>
  );
}
