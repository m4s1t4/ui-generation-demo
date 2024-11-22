'use client';

import { useChat } from 'ai/react';
import EnhancedSearchResults from '@/components/enhanced-search-results';
import { BotMessage } from '@/components/ai-response';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
    initialMessages: []
  });

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
        >
          Send
        </button>
      </form>

      <div className="space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
            {message.role === 'assistant' && (
              <>
                {message.toolInvocations?.length ? (
                  message.toolInvocations.map((toolInvocation) => {
                    if (toolInvocation.state === 'result' && toolInvocation.toolName === 'tavilySearch') {
                      const result = toolInvocation.result;
                      console.log('Tool Result:', result);

                      return (
                        <div key={toolInvocation.toolCallId} className="space-y-6">
                          <EnhancedSearchResults
                            query={result.query || input}
                            sources={result.sources || []}
                            answer={result.answer}
                            images={result.images || []}
                            relatedQuestions={result.relatedQuestions || []}
                          />
                          {message.content && (
                            <div className="mt-6">
                              <h2 className="text-lg font-semibold mb-4">AI Analysis</h2>
                              <BotMessage content={message.content} />
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })
                ) : (
                  <div className="mt-6">
                    <BotMessage content={message.content} />
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
