'use client'

import { useChat } from 'ai/react'
import EnhancedSearchResults from '@/components/enhanced-search-results'
import { BotMessage } from '@/components/ai-response'
import { VideoCarousel } from '@/components/video-results'

interface RelatedQuestion {
  text: string
  url: string
}

interface ToolResult {
  query?: string
  sources?: Array<{
    title: string
    url: string
    content: string
  }>
  answer?: string
  images?: Array<{
    url: string
    description: string
  }>
  videos?: Array<{
    title: string
    link: string
    thumbnail: string
    duration?: string
    views?: number
    date?: string
  }>
  relatedQuestions?: RelatedQuestion[]
}

interface ToolInvocation {
  id?: string
  state: 'result' | 'partial-call' | 'call'
  toolCallId: string
  toolName: string
  result?: ToolResult
}

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: []
  })

  return (
    <div className="mx-auto max-w-4xl p-4 space-y-4">
      <form onSubmit={handleSubmit} className="relative mb-8">
        <input
          className="w-full pl-10 pr-4 py-2 rounded-full bg-muted border"
          placeholder="Ask anything..."
          value={input}
          onChange={handleInputChange}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1 rounded-full bg-blue-500 text-white text-sm hover:bg-blue-600"
          disabled={isLoading}
        >
          {isLoading ? 'Thinking...' : 'Send'}
        </button>
      </form>

      <div className="space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
            {message.role === 'assistant' && (
              <>
                {message.toolInvocations?.length ? (
                  message.toolInvocations.map((toolInvocation: ToolInvocation) => {
                    if (toolInvocation.state === 'call') {
                      return (
                        <div key={toolInvocation.toolCallId} className="text-sm text-muted-foreground animate-pulse">
                          {toolInvocation.toolName === 'videoSearch'
                            ? '🎥 Buscando videos relacionados...'
                            : '🔍 Investigando información...'}
                        </div>
                      )
                    }

                    if (toolInvocation.state === 'result' && toolInvocation.result) {
                      const result = toolInvocation.result

                      if (toolInvocation.toolName === 'tavilySearch') {
                        return (
                          <div key={toolInvocation.toolCallId} className="space-y-6">
                            <EnhancedSearchResults
                              query={result.query ?? input}
                              sources={result.sources ?? []}
                              answer={result.answer ?? 'No answer available'}
                              images={result.images ?? []}
                              relatedQuestions={result.relatedQuestions ?? []}
                            />
                          </div>
                        )
                      }

                      if (toolInvocation.toolName === 'videoSearch' && result.videos && result.videos.length > 0) {
                        return (
                          <div key={toolInvocation.toolCallId} className="space-y-6">
                            <VideoCarousel videos={result.videos} />
                          </div>
                        )
                      }
                    }
                    return null
                  })
                ) : null}

                {message.content && (
                  <div className="mt-6">
                    <p className="text-lg font-semibold mb-4">Answer</p>
                    <BotMessage messages={[message]} />
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
