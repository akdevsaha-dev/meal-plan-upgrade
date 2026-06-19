"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
  strong: ({ children }) => (
    <strong className="font-bold text-neutral-900">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="my-2 list-disc space-y-1 pl-5 marker:text-[#A94420]">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 list-decimal space-y-1 pl-5 marker:text-[#A94420] marker:font-semibold">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed pl-1">{children}</li>,
  h1: ({ children }) => (
    <h1 className="mb-2 mt-1 text-base font-bold text-neutral-900">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-1 text-sm font-bold text-neutral-900">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1.5 mt-1 text-sm font-bold text-neutral-900">{children}</h3>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-[#A94420] underline underline-offset-2 hover:text-[#8a3619]"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-neutral-300 pl-3 italic text-neutral-600">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[0.85em] text-neutral-800">
      {children}
    </code>
  ),
  hr: () => <hr className="my-3 border-neutral-200" />,
};

export default function ChatMarkdown({ content }: { content: string }) {
  return (
    <div className="text-xs sm:text-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
