'use client'

import { type Message } from 'ai'
import { MemoizedReactMarkdown } from './ui/markdown'
import rehypeExternalLinks from 'rehype-external-links'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { cn } from '@/lib/utils'
import React from 'react'
import 'katex/dist/katex.min.css'

interface BotMessageProps {
  messages: Message[]
}

export function BotMessage({
  messages = []
}: BotMessageProps) {
  const getVideoId = (url: string) => {
    try {
      if (url.includes('youtube.com/embed/')) {
        return url.split('embed/')[1].split('"')[0]
      }
      const urlParams = new URLSearchParams(new URL(url).search)
      return urlParams.get('v') || url.split('watch?v=')[1]
    } catch {
      return null
    }
  }

  const processContent = (content: string) => {
    const blockProcessedContent = content.replace(
      /\\\[([\s\S]*?)\\\]/g,
      (_, equation) => `$$${equation}$$`
    )
    const processedContent = blockProcessedContent.replace(
      /\\\(([\s\S]*?)\\\)/g,
      (_, equation) => `$${equation}$`
    )

    return processedContent
      .replace(
        /<iframe[^>]*src="[^"]*embed\/([^"]*)"[^>]*><\/iframe>/g,
        (match, videoId) => `[Video](https://youtube.com/watch?v=${videoId})`
      )
      .replace(/\s*-\s*(?=\n|$)/g, '')
      .replace(/<u>([^<]+)<\/u>/g, '$1')
      .replace(/!\[.*?\]\((.*?)\)/g, '![]($1)')
      .replace(/🎥\s*\[(.*?)\]\((.*?)\)\s*-.*?(?=\n|$)/g, '🎥 [$1]($2)')
  }

  return (
    <div className="max-w-2xl mx-auto">
      {messages?.length > 0 && messages.map((message, index) => {
        const containsLaTeX = /\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)/.test(message.content || '')

        return (
          <div key={index} className={cn(
            "px-4 py-8 space-y-4",
            "prose prose-neutral dark:prose-invert",
            "prose-h3:text-lg prose-h3:font-medium prose-h3:text-neutral-900 dark:prose-h3:text-neutral-100",
            "prose-h4:text-base prose-h4:font-normal prose-h4:text-neutral-800 dark:prose-h4:text-neutral-200",
            "prose-p:text-sm prose-p:leading-relaxed prose-p:text-neutral-700 dark:prose-p:text-neutral-300",
            "prose-li:text-sm prose-li:text-neutral-700 dark:prose-li:text-neutral-300",
            "prose-blockquote:text-sm prose-blockquote:text-neutral-600 dark:prose-blockquote:text-neutral-400 prose-blockquote:border-neutral-200 dark:prose-blockquote:border-neutral-800",
            "prose-code:text-sm prose-code:text-neutral-800 dark:prose-code:text-neutral-200 prose-code:bg-neutral-100 dark:prose-code:bg-neutral-800 prose-code:rounded",
            "prose-a:text-blue-600 hover:prose-a:text-blue-700 dark:prose-a:text-blue-400 dark:hover:prose-a:text-blue-300"
          )}>
            <MemoizedReactMarkdown
              remarkPlugins={containsLaTeX ? [remarkGfm, remarkMath] : [remarkGfm]}
              rehypePlugins={containsLaTeX ? [
                [rehypeExternalLinks, { target: '_blank' }],
                rehypeKatex
              ] : [
                [rehypeExternalLinks, { target: '_blank' }]
              ]}
              components={{
                img: ({ ...props }) => (
                  <img
                    {...props}
                    className="rounded-lg max-h-64 object-cover my-4"
                    loading="lazy"
                  />
                ),
                a: ({ href, children, ...props }) => {
                  const videoId = getVideoId(href || '')
                  if (videoId) {
                    return (
                      <span className="not-prose block aspect-video w-full my-4">
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title={children?.toString() || 'YouTube video'}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="rounded-lg shadow-sm"
                        />
                      </span>
                    )
                  }
                  return (
                    <a
                      href={href}
                      {...props}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {children}
                    </a>
                  )
                }
              }}
            >
              {processContent(message.content || '')}
            </MemoizedReactMarkdown>
          </div>
        )
      })}
    </div>
  )
}
