"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import "highlight.js/styles/github-dark.css";
import { cn } from "@/lib/utils";
import type { Components } from "react-markdown";
import { Children, isValidElement, type ReactNode } from "react";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

// ── Themed section heading map ────────────────────────────────────────────────
// Maps emoji prefixes to themed colors. Used to make pedagogical sections
// visually distinct in the lesson body.
const SECTION_THEMES: Array<{
  emoji: string;
  bg: string;
  border: string;
  text: string;
  label: string;
}> = [
  { emoji: "🎯", bg: "bg-[var(--token-cyan)]/10",    border: "border-[var(--token-cyan)]/40",    text: "text-[var(--token-cyan)]",    label: "Goal" },
  { emoji: "🌍", bg: "bg-[var(--token-amber)]/10",   border: "border-[var(--token-amber)]/40",   text: "text-[var(--token-amber)]",   label: "Analogy" },
  { emoji: "🗃️", bg: "bg-[var(--token-blue)]/10",   border: "border-[var(--token-blue)]/40",   text: "text-[var(--token-blue)]",   label: "Data" },
  { emoji: "📖", bg: "bg-[var(--token-blue)]/10",    border: "border-[var(--token-blue)]/40",    text: "text-[var(--token-blue)]",    label: "Start From Zero" },
  { emoji: "🔨", bg: "bg-[var(--token-purple)]/10",  border: "border-[var(--token-purple)]/40",  text: "text-[var(--token-purple)]",  label: "Level Up" },
  { emoji: "🧩", bg: "bg-[var(--token-purple)]/10",  border: "border-[var(--token-purple)]/40",  text: "text-[var(--token-purple)]",  label: "Visual" },
  { emoji: "🌟", bg: "bg-[var(--token-amber)]/10",   border: "border-[var(--token-amber)]/40",   text: "text-[var(--token-amber)]",   label: "Highlight" },
  { emoji: "🔁", bg: "bg-[var(--token-cyan)]/10",    border: "border-[var(--token-cyan)]/40",    text: "text-[var(--token-cyan)]",    label: "Loop" },
  { emoji: "🔎", bg: "bg-[var(--token-blue)]/10",    border: "border-[var(--token-blue)]/40",    text: "text-[var(--token-blue)]",    label: "Inspect" },
  { emoji: "⚡", bg: "bg-[var(--token-amber)]/10",   border: "border-[var(--token-amber)]/40",   text: "text-[var(--token-amber)]",   label: "Behavior" },
  { emoji: "💡", bg: "bg-[var(--token-amber)]/10",   border: "border-[var(--token-amber)]/40",   text: "text-[var(--token-amber)]",   label: "Tip" },
  { emoji: "💬", bg: "bg-[var(--token-purple)]/10",  border: "border-[var(--token-purple)]/40",  text: "text-[var(--token-purple)]",  label: "Note" },
  { emoji: "🧪", bg: "bg-[var(--token-emerald)]/10", border: "border-[var(--token-emerald)]/40", text: "text-[var(--token-emerald)]", label: "Practice" },
  { emoji: "🎯", bg: "bg-[var(--token-cyan)]/10",    border: "border-[var(--token-cyan)]/40",    text: "text-[var(--token-cyan)]",    label: "Target" },
  { emoji: "⚠️", bg: "bg-[var(--token-red)]/10",     border: "border-[var(--token-red)]/40",     text: "text-[var(--token-red)]",     label: "Watch Out" },
  { emoji: "🧠", bg: "bg-[var(--token-purple)]/10",  border: "border-[var(--token-purple)]/40",  text: "text-[var(--token-purple)]",  label: "Mental Model" },
  { emoji: "📝", bg: "bg-[var(--token-cyan)]/10",    border: "border-[var(--token-cyan)]/40",    text: "text-[var(--token-cyan)]",    label: "Check Understanding" },
  { emoji: "🚀", bg: "bg-[var(--token-emerald)]/10", border: "border-[var(--token-emerald)]/40", text: "text-[var(--token-emerald)]", label: "Unlocked" },
  { emoji: "🏆", bg: "bg-[var(--token-amber)]/10",   border: "border-[var(--token-amber)]/40",   text: "text-[var(--token-amber)]",   label: "Reward" },
  { emoji: "🎓", bg: "bg-[var(--token-blue)]/10",    border: "border-[var(--token-blue)]/40",    text: "text-[var(--token-blue)]",    label: "Done" },
  { emoji: "📐", bg: "bg-[var(--token-blue)]/10",    border: "border-[var(--token-blue)]/40",    text: "text-[var(--token-blue)]",    label: "Standard" },
  { emoji: "📚", bg: "bg-[var(--token-purple)]/10",  border: "border-[var(--token-purple)]/40",  text: "text-[var(--token-purple)]",  label: "Reference" },
  { emoji: "🗓️", bg: "bg-[var(--token-cyan)]/10",   border: "border-[var(--token-cyan)]/40",   text: "text-[var(--token-cyan)]",   label: "Schedule" },
  { emoji: "✍️", bg: "bg-[var(--token-emerald)]/10", border: "border-[var(--token-emerald)]/40", text: "text-[var(--token-emerald)]", label: "Write" },
  { emoji: "📬", bg: "bg-[var(--token-blue)]/10",    border: "border-[var(--token-blue)]/40",    text: "text-[var(--token-blue)]",    label: "Retro" },
];

function findTheme(text: string): typeof SECTION_THEMES[number] | null {
  for (const theme of SECTION_THEMES) {
    if (text.startsWith(theme.emoji)) return theme;
  }
  return null;
}

// Extract text from React children (for theme detection)
function getChildText(children: ReactNode): string {
  let text = "";
  Children.forEach(children, (child) => {
    if (typeof child === "string") text += child;
    else if (typeof child === "number") text += String(child);
    else if (isValidElement<{ children?: ReactNode }>(child)) {
      text += getChildText(child.props.children);
    }
  });
  return text.trim();
}

// ── Smart blockquote callout types ────────────────────────────────────────────
// If a blockquote starts with **Rule:**, **Warning:**, **Tip:**, **Note:**,
// **Important:**, **Practical advice:**, we style it specially.
function detectCalloutKind(text: string): { kind: string; bg: string; border: string; iconColor: string; label: string } | null {
  const lower = text.toLowerCase().trim();
  if (lower.startsWith("rule:") || lower.startsWith("your rule") || lower.startsWith("practical rule") || lower.startsWith("the rule"))
    return { kind: "rule", bg: "bg-[var(--token-blue)]/8", border: "border-l-[var(--token-blue)]", iconColor: "text-[var(--token-blue)]", label: "📐 Rule" };
  if (lower.startsWith("warning:") || lower.startsWith("watch out") || lower.startsWith("critical:") || lower.startsWith("never"))
    return { kind: "warning", bg: "bg-[var(--token-red)]/8", border: "border-l-[var(--token-red)]", iconColor: "text-[var(--token-red)]", label: "⚠️ Warning" };
  if (lower.startsWith("tip:") || lower.startsWith("hint:") || lower.startsWith("memory trick") || lower.startsWith("shortcut:"))
    return { kind: "tip", bg: "bg-[var(--token-amber)]/8", border: "border-l-[var(--token-amber)]", iconColor: "text-[var(--token-amber)]", label: "💡 Tip" };
  if (lower.startsWith("important:") || lower.startsWith("the key") || lower.startsWith("key insight"))
    return { kind: "important", bg: "bg-[var(--token-emerald)]/8", border: "border-l-[var(--token-emerald)]", iconColor: "text-[var(--token-emerald)]", label: "✨ Important" };
  if (lower.startsWith("note:") || lower.startsWith("practical advice"))
    return { kind: "note", bg: "bg-[var(--token-purple)]/8", border: "border-l-[var(--token-purple)]", iconColor: "text-[var(--token-purple)]", label: "📝 Note" };
  return null;
}

// ── Component map ─────────────────────────────────────────────────────────────
const components: Components = {
  // H1 — page title (rare in lesson body)
  h1: ({ children, ...props }) => (
    <h1
      className="mt-8 mb-4 scroll-m-20 text-2xl font-bold tracking-tight text-foreground first:mt-0"
      {...props}
    >
      {children}
    </h1>
  ),

  // H2 — pedagogical section markers (themed by emoji prefix)
  h2: ({ children, id, ...props }) => {
    const text = getChildText(children);
    const theme = findTheme(text);
    if (theme) {
      return (
        <div className="mt-10 mb-4 first:mt-2">
          <h2
            id={id}
            className={cn(
              "scroll-m-20 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-base font-semibold tracking-tight shadow-sm",
              theme.bg,
              theme.border,
              theme.text
            )}
            {...props}
          >
            {children}
          </h2>
        </div>
      );
    }
    return (
      <h2
        id={id}
        className="mt-8 mb-3 scroll-m-20 text-xl font-semibold tracking-tight text-foreground border-b border-border pb-1.5 first:mt-0"
        {...props}
      >
        {children}
      </h2>
    );
  },

  h3: ({ children, id, ...props }) => (
    <h3
      id={id}
      className="mt-6 mb-2 scroll-m-20 text-base font-semibold text-foreground first:mt-0"
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="mt-5 mb-2 scroll-m-20 text-sm font-semibold text-foreground/95 first:mt-0" {...props}>
      {children}
    </h4>
  ),
  h5: ({ children, ...props }) => (
    <h5 className="mt-4 mb-2 text-sm font-semibold text-foreground first:mt-0" {...props}>
      {children}
    </h5>
  ),
  h6: ({ children, ...props }) => (
    <h6 className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground first:mt-0" {...props}>
      {children}
    </h6>
  ),

  // Paragraphs
  p: ({ children, ...props }) => (
    <p className="mb-4 leading-7 text-foreground/90 last:mb-0" {...props}>
      {children}
    </p>
  ),

  // Links
  a: ({ children, href, ...props }) => (
    <a
      href={href}
      className="text-primary underline underline-offset-4 decoration-primary/50 hover:decoration-primary transition-colors font-medium"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      {...props}
    >
      {children}
    </a>
  ),

  // Lists
  ul: ({ children, ...props }) => (
    <ul className="mb-4 ml-6 list-disc space-y-1.5 text-foreground/90 marker:text-muted-foreground" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="mb-4 ml-6 list-decimal space-y-1.5 text-foreground/90 marker:text-muted-foreground" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="leading-7" {...props}>
      {children}
    </li>
  ),

  // Smart blockquote — themed callouts when starting with **Keyword:**
  blockquote: ({ children, ...props }) => {
    const text = getChildText(children);
    const callout = detectCalloutKind(text);
    if (callout) {
      return (
        <div
          className={cn(
            "mb-4 rounded-r-lg border-l-4 py-3 pl-4 pr-3",
            callout.bg,
            callout.border
          )}
          {...(props as React.HTMLAttributes<HTMLDivElement>)}
        >
          <div className={cn("mb-1 text-xs font-bold uppercase tracking-wider", callout.iconColor)}>
            {callout.label}
          </div>
          <div className="text-sm leading-7 text-foreground/90 [&>p]:mb-0 [&>p+p]:mt-2">
            {children}
          </div>
        </div>
      );
    }
    return (
      <blockquote
        className="mb-4 border-l-4 border-primary/40 bg-muted/20 pl-4 py-2 pr-3 rounded-r-md italic text-muted-foreground"
        {...props}
      >
        {children}
      </blockquote>
    );
  },

  // Inline code & code blocks
  code: ({ children, className, ...props }) => {
    const isBlock = className?.startsWith("language-");
    if (isBlock) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded border border-border bg-muted px-[0.35em] py-[0.1em] text-[0.875em] font-mono text-foreground"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }) => (
    <pre
      className="mb-4 overflow-x-auto rounded-lg border border-border bg-[#0d1117] p-4 text-sm leading-relaxed shadow-inner"
      {...props}
    >
      {children}
    </pre>
  ),

  // Horizontal rule
  hr: ({ ...props }) => <hr className="my-8 border-border/60" {...props} />,

  // Strong / em
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-foreground" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="italic text-foreground/90" {...props}>
      {children}
    </em>
  ),

  // Tables (GFM)
  table: ({ children, ...props }) => (
    <div className="mb-4 w-full overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm text-left" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }) => (
    <tbody className="divide-y divide-border/30" {...props}>
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }) => (
    <tr className="hover:bg-muted/20 transition-colors" {...props}>
      {children}
    </tr>
  ),
  th: ({ children, ...props }) => (
    <th className="px-4 py-2.5 font-semibold text-left" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="px-4 py-2.5 text-foreground/85" {...props}>
      {children}
    </td>
  ),

  // Task list items (GFM)
  input: ({ type, checked, ...props }) => {
    if (type === "checkbox") {
      return (
        <input
          type="checkbox"
          checked={checked}
          readOnly
          className="mr-2 h-3.5 w-3.5 rounded border-border accent-primary"
          {...props}
        />
      );
    }
    return <input type={type} {...props} />;
  },

  img: ({ src, alt, ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? ""}
      className="my-4 max-w-full rounded-lg border border-border"
      loading="lazy"
      {...props}
    />
  ),
};

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div
      className={cn(
        "text-sm text-foreground/90",
        "[&_.hljs]:bg-transparent [&_.hljs]:p-0",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
