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
import { VideoCarousel } from './video-results'
import EnhancedSearchResults from './enhanced-search-results'

interface BotMessageProps {
  messages: Message[]
}

interface SearchResult {
  title: string
  url: string
  content: string
}

interface Video {
  title: string
  link: string
  thumbnail: string
  duration?: string
  views?: number
  date?: string
}

const getVideoId = (url: string): string | null => {
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

const extractSearchResults = (content: string): SearchResult[] => {
  const results: SearchResult[] = []
  const regex = /🔍\s*\[(.*?)\]\((.*?)\)\s*-\s*(.*?)(?=\n|$)/g
  let match

  while ((match = regex.exec(content)) !== null) {
    results.push({
      title: match[1],
      url: match[2],
      content: match[3]
    })
  }

  return results
}

const extractVideos = (content: string): Video[] => {
  const videos: Video[] = []
  const regex = /🎥\s*\[(.*?)\]\((.*?)\)(?:\s*-\s*(?:Duración: (.*?)\s*\|\s*)?(?:Vistas: (.*?)\s*\|\s*)?(?:Fecha: (.*?))?)?(?=\n|$)/g
  let match

  while ((match = regex.exec(content)) !== null) {
    videos.push({
      title: match[1],
      link: match[2],
      thumbnail: '',
      duration: match[3],
      views: match[4] ? parseInt(match[4].replace(/,/g, '')) : undefined,
      date: match[5]
    })
  }

  return videos
}

const processContent = (content: string): string => {
  return content
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, equation) => `$$${equation}$$`)
    .replace(/\\$$([\s\S]*?)\\$$/g, (_, equation) => `$${equation}$`)
    .replace(/<iframe[^>]*src="[^"]*embed\/([^"]*)"[^>]*><\/iframe>/g, (_, videoId) =>
      `[Video](https://youtube.com/watch?v=${videoId})`
    )
    .replace(/\s*-\s*(?=\n|$)/g, '')
    .replace(/<u>([^<]+)<\/u>/g, '$1')
    .replace(/!\[.*?\]$$(.*?)$$/g, '![]($1)')
    // Eliminar los resultados de búsqueda y videos del contenido principal
    .replace(/🔍\s*\[.*?\]\(.*?\)\s*-\s*.*?(?=\n|$)/g, '')
    .replace(/🎥\s*\[.*?\]\(.*?\)(?:\s*-\s*(?:Duración:.*?\s*\|\s*)?(?:Vistas:.*?\s*\|\s*)?(?:Fecha:.*?)?)?(?=\n|$)/g, '')
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
    p: ({ children, node, ...props }) => {
      if (
        node?.children?.length === 1 &&
        node.children[0].type === 'element' &&
        node.children[0].tagName === 'img'
      ) {
        return <>{children}</>
      }

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
    a: ({ href, children, ...props }) => {
      const videoId = getVideoId(href || '')
      if (videoId) {
        return (
          <div className="block aspect-video w-full my-4">
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
          </div>
        )
      }
      return (
        <a
          href={href}
          {...props}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200"
        >
          {children}
        </a>
      )
    },
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
      {messages.map((message, index) => {
        const content = message.content || ''
        const searchResults = extractSearchResults(content)
        const videos = extractVideos(content)
        const processedContent = processContent(content)

        return (
          <div key={index} className="space-y-6 px-4 py-6">
            {searchResults.length > 0 && (
              <EnhancedSearchResults results={searchResults} />
            )}
            {videos.length > 0 && (
              <VideoCarousel videos={videos} />
            )}
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[
                [rehypeExternalLinks, { target: '_blank' }],
                rehypeKatex
              ]}
              components={components}
            >
              {processedContent}
            </ReactMarkdown>
          </div>
        )
      })}
    </div>
  )
}
