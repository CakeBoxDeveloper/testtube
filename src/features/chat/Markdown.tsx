"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownProps {
  children: string;
}

export function Markdown({ children }: MarkdownProps) {
  return (
    <div className="markdown-body text-sm leading-relaxed text-[var(--text-primary)] break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="my-1 first:mt-0 last:mb-0">{children}</p>,
          ul: ({ children }) => (
            <ul className="list-disc pl-5 my-1 space-y-0.5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 my-1 space-y-0.5">{children}</ol>
          ),
          li: ({ children }) => <li className="text-sm">{children}</li>,
          code: ({ children, className }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <pre className="my-2 p-2 rounded-md bg-black/40 overflow-x-auto text-xs">
                  <code>{children}</code>
                </pre>
              );
            }
            return (
              <code className="px-1 py-0.5 rounded bg-black/30 text-[12px]">
                {children}
              </code>
            );
          },
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="underline text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-[var(--text-primary)]">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="text-[var(--text-secondary)]">{children}</em>
          ),
          hr: () => <hr className="my-2 border-[var(--glass-border)]" />,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-[var(--glass-border)] pl-3 my-1 text-[var(--text-secondary)]">
              {children}
            </blockquote>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
