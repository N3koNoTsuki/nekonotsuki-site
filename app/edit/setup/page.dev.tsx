import PageEditor from "@/components/admin/PageEditor";
import { getPage } from "@/lib/data";

export default async function EditSetupPage() {
  const page = await getPage("setup");

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold text-rose-deep">Page « Setup »</h1>
        <p className="text-ink/60 dark:text-[#efe6ee]/60">Ton matériel &amp; tes logiciels, entièrement en Markdown.</p>
      </header>
      <div className="glass p-6">
        <PageEditor slug="setup" initialTitle={page?.title ?? "Setup"} initialContent={page?.content ?? ""} />
      </div>
    </div>
  );
}
