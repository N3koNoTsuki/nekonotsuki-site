import type { Metadata } from "next";
import { getPage } from "@/lib/data";
import Markdown from "@/components/Markdown";
import { EmptyState } from "@/components/ui";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = { title: "Setup" };

export default async function SetupPage() {
  const page = await getPage("setup");

  if (!page || !page.content.trim()) {
    return <EmptyState>Mon setup arrive bientôt. 🖥️</EmptyState>;
  }

  return (
    <Reveal>
      <article className="glass mx-auto max-w-3xl p-8 md:p-12">
        <Markdown>{page.content}</Markdown>
      </article>
    </Reveal>
  );
}
