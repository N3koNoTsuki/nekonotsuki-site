import { getPage } from "@/lib/data";
import PageEditor from "@/components/admin/PageEditor";

export const dynamic = "force-dynamic";

export default async function AdminAboutPage() {
  const page = await getPage("about");

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold text-rose-deep">Page « À propos »</h1>
        <p className="text-ink/60 dark:text-[#efe6ee]/60">Page libre, entièrement en Markdown.</p>
      </header>
      <div className="glass p-6">
        <PageEditor slug="about" initialTitle={page?.title ?? "À propos"} initialContent={page?.content ?? ""} />
      </div>
    </div>
  );
}
