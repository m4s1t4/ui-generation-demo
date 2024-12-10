"use client";

import React from "react";
import { type Message } from "ai";
import ReactMarkdown from "react-markdown";
import rehypeExternalLinks from "rehype-external-links";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface BotMessageProps {
  messages: Message[];
}

const getVideoId = (url: string): string | null => {
  try {
    if (url.includes("youtube.com/embed/")) {
      return url.split("embed/")[1].split('"')[0];
    }
    const urlParams = new URLSearchParams(new URL(url).search);
    return urlParams.get("v") || url.split("watch?v=")[1];
  } catch {
    return null;
  }
};

const processContent = (content: string): string => {
  return content
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, equation) => `$$${equation}$$`)
    .replace(/\\$$([\s\S]*?)\\$$/g, (_, equation) => `$${equation}$`)
    .replace(
      /<iframe[^>]*src="[^"]*embed\/([^"]*)"[^>]*><\/iframe>/g,
      (_, videoId) => `[Video](https://youtube.com/watch?v=${videoId})`,
    )
    .replace(/\s*-\s*(?=\n|$)/g, "")
    .replace(/<u>([^<]+)<\/u>/g, "$1")
    .replace(/!\[.*?\]$$(.*?)$$/g, "![]($1)")
    .replace(/🎥\s*\[(.*?)\]$$(.*?)$$\s*-.*?(?=\n|$)/g, "🎥 [$1]($2)");
};

export function BotMessage({ messages = [] }: BotMessageProps) {
  return (
    <div className="max-w-3xl mx-auto">
      {messages.map((message, index) => (
        <div key={index} className="space-y-6 px-4 py-6">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[
              [rehypeExternalLinks, { target: "_blank" }],
              rehypeKatex,
            ]}
            components={{
              h1: ({ node, ...props }) => (
                <h1
                  className="text-2xl font-bold text-neutral-900 mb-6"
                  {...props}
                />
              ),
              h2: ({ node, ...props }) => (
                <h2
                  className="text-xl font-semibold text-neutral-800 mb-4"
                  {...props}
                />
              ),
              h3: ({ node, ...props }) => (
                <h3
                  className="text-lg font-medium text-neutral-800 mb-2"
                  {...props}
                />
              ),
              p: ({ node, children }) => {
                // Si el children es una imagen, retornamos directamente el children sin el párrafo
                if (React.Children.toArray(children).some(child =>
                  React.isValidElement(child) && child.type === 'div'
                )) {
                  return <>{children}</>
                }
                // Si no es una imagen, retornamos el párrafo normal
                return (
                  <p className="text-base text-neutral-700 leading-relaxed mb-4 ml-4">
                    {children}
                  </p>
                )
              },
              strong: ({ node, ...props }) => (
                <strong className="font-semibold text-neutral-900" {...props} />
              ),
              a: ({ href, children, ...props }) => {
                const videoId = getVideoId(href || "");
                if (videoId) {
                  return (
                    <span className="block aspect-video w-full my-4">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={children?.toString() || "YouTube video"}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="rounded-lg shadow-sm"
                      />
                    </span>
                  );
                }
                return (
                  <a
                    href={href}
                    {...props}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    {children}
                  </a>
                );
              },
              img: ({ alt, src, ...props }) => (
                <div className="my-6">
                  <img
                    alt={alt}
                    src={src}
                    {...props}
                    className="rounded-lg w-full object-cover max-h-[400px]"
                    loading="lazy"
                  />
                  {alt && alt !== "image" && (
                    <div className="text-sm text-neutral-500 mt-2 text-center">
                      {alt}
                    </div>
                  )}
                </div>
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc ml-6 mb-4 space-y-2" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal ml-6 mb-4 space-y-2" {...props} />
              ),
              li: ({ node, ...props }) => (
                <li className="text-neutral-700" {...props} />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="border-l-4 border-neutral-200 pl-4 my-4 text-neutral-600 italic"
                  {...props}
                />
              ),
            }}
          >
            {processContent(message.content || "")}
          </ReactMarkdown>
        </div>
      ))}
    </div>
  );
}
