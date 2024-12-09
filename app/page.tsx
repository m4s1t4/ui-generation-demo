'use client'

import { useEffect } from 'react'
import { useChat, Message } from 'ai/react'
import EnhancedSearchResults from '@/components/enhanced-search-results'
import { VideoCarousel } from '@/components/video-results'
import { BotMessage } from '@/components/ai-response'
import { ErrorBoundary } from 'react-error-boundary'


// Componente para manejar errores
function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="p-4 border border-red-500 rounded-lg">
      <p className="text-red-500">Error al renderizar el contenido:</p>
      <pre className="text-sm">{error.message}</pre>
    </div>
  )
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
  relatedQuestions?: Array<{
    text: string
    url: string
  }>
}

interface MessageWithTools extends Message {
  toolInvocations?: Array<{
    id?: string
    state: 'result' | 'partial-call' | 'call'
    toolCallId: string
    toolName: string
    result?: ToolResult
  }>
}

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat<MessageWithTools>({
    api: '/api/chat',
    initialMessages: []
  })

  // Añadir logs para depuración
  useEffect(() => {
    console.log('Messages:', messages)
  }, [messages])

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

      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <div className="space-y-4">
          {messages.map((message, index) => {
            const toolInvocations = (message as MessageWithTools).toolInvocations

            // Log para depuración
            console.log('Tool Invocations:', toolInvocations)

            return (
              <div key={index} className="space-y-4">
                {toolInvocations?.map((toolInvocation, toolIndex) => {
                  const { toolName, state, result } = toolInvocation

                  // Log para depuración
                  console.log('Processing tool:', { toolName, state, result })

                  if (state === 'result' && result) {
                    if (toolName === 'tavilySearch' && result.sources?.length > 0) {
                      // Log para depuración
                      console.log('Rendering tavilySearch with:', result)
                      return (
                        <ErrorBoundary key={`${index}-${toolIndex}`} FallbackComponent={ErrorFallback}>
                          <div className="border rounded-lg p-4 bg-white/50">
                            <EnhancedSearchResults
                              query={result.query || ''}
                              sources={result.sources || []}
                              answer={result.answer}
                              images={result.images || []}
                              relatedQuestions={result.relatedQuestions || []}
                            />
                          </div>
                        </ErrorBoundary>
                      )
                    } else if (toolName === 'videoSearch' && result.videos && result.videos.length > 0) {
                      // Log para depuración
                      console.log('Rendering videoSearch with:', result.videos)
                      return (
                        <ErrorBoundary key={`${index}-${toolIndex}`} FallbackComponent={ErrorFallback}>
                          <div className="border rounded-lg p-4 bg-white/50">
                            <VideoCarousel videos={result.videos} />
                          </div>
                        </ErrorBoundary>
                      )
                    }
                  }
                  return null
                })}

                {message.role === 'assistant' && message.content && (
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <div className="rounded-lg bg-muted">
                      <BotMessage messages={[message]} />
                    </div>
                  </ErrorBoundary>
                )}
              </div>
            )
          })}
        </div>
      </ErrorBoundary>
    </div>
  )
}
