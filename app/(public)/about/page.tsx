import type { Metadata } from "next";
import { getPage } from "@/lib/data";
import Markdown from "@/components/Markdown";
import { EmptyState } from "@/components/ui";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "À propos" };

export default async function AboutPage() {
  const page = await getPage("about");

  if (!page || !page.content.trim()) {
    return <EmptyState>Cette page sera bientôt remplie. 🌼</EmptyState>;
  }

  return (
    <Reveal>
      <article className="glass mx-auto max-w-3xl p-8 md:p-12">
        <Markdown>{page.content}</Markdown>
      </article>
    </Reveal>
  );
}
