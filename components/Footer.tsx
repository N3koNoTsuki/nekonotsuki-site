export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-white/40 bg-cream/60 py-8 text-center text-sm text-ink/60 backdrop-blur-sm dark:border-white/10 dark:bg-[#241f29]/60 dark:text-[#efe6ee]/60">
      <p className="flex items-center justify-center gap-1.5">
        <span aria-hidden>🌸</span>
        Fait avec amour — NekoNoTsuki © {year}
        <span aria-hidden>🌸</span>
      </p>
    </footer>
  );
}
