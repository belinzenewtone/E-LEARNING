"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { cn } from "@/lib/utils";
import type { Components } from "react-markdown";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

// Custom component map for styled markdown rendering
const components: Components = {
  // Headings
  h1: ({ children, ...props }) => (
    <h1
      className="mt-8 mb-4 scroll-m-20 text-2xl font-bold tracking-tight text-foreground first:mt-0"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className="mt-7 mb-3 scroll-m-20 text-xl font-semibold tracking-tight text-foreground border-b border-border pb-1.5 first:mt-0"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="mt-6 mb-2 scroll-m-20 text-lg font-semibold text-foreground first:mt-0"
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4
      className="mt-5 mb-2 scroll-m-20 text-base font-semibold text-foreground first:mt-0"
      {...props}
    >
      {children}
    </h4>
  ),
  h5: ({ children, ...props }) => (
    <h5
      className="mt-4 mb-2 text-sm font-semibold text-foreground first:mt-0"
      {...props}
    >
      {children}
    </h5>
  ),
  h6: ({ children, ...props }) => (
    <h6
      className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground first:mt-0"
      {...props}
    >
      {children}
    </h6>
  ),

  // Paragraphs
  p: ({ children, ...props }) => (
    <p
      className="mb-4 leading-7 text-foreground/90 last:mb-0"
      {...props}
    >
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
    <ul
      className="mb-4 ml-6 list-disc space-y-1.5 text-foreground/90 marker:text-muted-foreground"
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol
      className="mb-4 ml-6 list-decimal space-y-1.5 text-foreground/90 marker:text-muted-foreground"
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="leading-7" {...props}>
      {children}
    </li>
  ),

  // Blockquotes
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="mb-4 border-l-4 border-primary/40 bg-muted/20 pl-4 py-2 pr-3 rounded-r-md italic text-muted-foreground"
      {...props}
    >
      {children}
    </blockquote>
  ),

  // Inline code
  code: ({ children, className, ...props }) => {
    // If there is a language class it will be a code block handled by <pre>
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

  // Code blocks (wraps <code> with a language class)
  pre: ({ children, ...props }) => (
    <pre
      className="mb-4 overflow-x-auto rounded-lg border border-border bg-[#0d1117] p-4 text-sm leading-relaxed"
      {...props}
    >
      {children}
    </pre>
  ),

  // Horizontal rule
  hr: ({ ...props }) => (
    <hr className="my-6 border-border" {...props} />
  ),

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
      <table
        className="w-full text-sm text-left"
        {...props}
      >
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

  // Images
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
        // Ensure highlight.js github-dark background is overridden to fit our card bg
        "[&_.hljs]:bg-transparent [&_.hljs]:p-0",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
