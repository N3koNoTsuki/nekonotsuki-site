import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { cn } from "@/lib/utils";

type MarkdownProps = {
  children: string;
  className?: string;
};

/**
 * Shared Markdown renderer used both on public pages (SSR) and in the
 * admin editor preview. Supports GFM (tables, task lists, strikethrough),
 * raw HTML, and syntax highlighting via highlight.js.
 *
 * Styling relies on the `.prose-kawaii` class defined in globals.css so it
 * renders identically everywhere.
 */
export default function Markdown({ children, className }: MarkdownProps) {
  return (
    <div className={cn("prose-kawaii", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeHighlight, { detect: true, ignoreMissing: true }]]}
        components={{
          a: ({ node, ...props }) => (
            <a {...props} target={props.href?.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
