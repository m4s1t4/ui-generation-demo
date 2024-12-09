'use client'

import React from 'react'
import { type Message } from 'ai'
import ReactMarkdown from 'react-markdown'
import rehypeExternalLinks from 'rehype-external-links'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import type { Components } from 'react-markdown'

interface BotMessageProps {
  messages: Message[]
}

export function BotMessage({ messages = [] }: BotMessageProps) {
  const components: Components = {
    h1: ({ children, ...props }) => (
      <h1 className="text-2xl font-bold text-neutral-900 mb-6" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 className="text-xl font-semibold text-neutral-800 mb-4" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 className="text-lg font-medium text-neutral-800 mb-2 mt-6 border-b border-neutral-200 pb-2" {...props}>
        {children}
      </h3>
    ),
    p: ({ children, node, ...props }: {
      children: React.ReactNode
      node?: {
        children?: Array<{
          type: string
          tagName?: string
        }>
      }
      [key: string]: any
    }) => {
      // Check if the paragraph contains only an image
      const hasOnlyImage = node?.children?.length === 1 && node.children[0].type === 'element' && node.children[0].tagName === 'img'

      // If it's just an image, don't wrap in p tag
      if (hasOnlyImage) return <>{children}</>

      return (
        <p className="text-base text-neutral-700 leading-relaxed mb-4 ml-4" {...props}>
          {children}
        </p>
      )
    },
    img: ({ src, alt, ...props }) => (
      <figure className="my-6 ml-4">
        <img
          src={src}
          alt={alt}
          {...props}
          className="rounded-lg w-full object-cover max-h-[400px] shadow-lg hover:shadow-xl transition-shadow duration-200"
          loading="lazy"
        />
        {alt && alt !== 'image' && (
          <figcaption className="text-sm text-neutral-500 mt-2 text-center">
            {alt}
          </figcaption>
        )}
      </figure>
    ),
    ul: ({ children, ...props }) => (
      <ul className="list-disc ml-6 mb-4 space-y-2" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="list-decimal ml-6 mb-4 space-y-2" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="text-neutral-700" {...props}>
        {children}
      </li>
    ),
    blockquote: ({ children, ...props }) => (
      <blockquote
        className="border-l-4 border-neutral-200 pl-4 my-4 text-neutral-600 italic"
        {...props}
      >
        {children}
      </blockquote>
    ),
  }

  return (
    <div className="max-w-3xl mx-auto">
      {messages.map((message, index) => (
        <div key={index} className="space-y-6 px-4 py-6">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[
              [rehypeExternalLinks, { target: '_blank' }],
              rehypeKatex
            ]}
            components={components}
          >
            {message.content || ''}
          </ReactMarkdown>
        </div>
      ))}
    </div>
  )
}
