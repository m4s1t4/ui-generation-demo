"use client";

import { useChat } from "ai/react";
import EnhancedSearchResults from "@/components/enhanced-search-results";
import { BotMessage } from "@/components/ai-response";
import { useState } from "react";
import { Message as AIMessage } from "ai";

interface MessageProps {
  message: AIMessage;
  input: string;
}

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
    initialMessages: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await handleSubmit(event);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send message. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  console.log("Messages:", messages);

  return (
    <div className="mx-auto max-w-4xl p-4 space-y-4">
      <form onSubmit={onSubmit} className="relative mb-8">
        <input
          className="w-full pl-10 pr-4 py-2 rounded-full bg-muted border"
          placeholder="Ask anything..."
          value={input}
          onChange={handleInputChange}
          aria-label="Chat input"
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1 rounded-full bg-blue-500 text-white text-sm transition-all
            ${isLoading
              ? 'opacity-70 cursor-not-allowed flex items-center gap-2'
              : 'hover:bg-blue-600'
            }`}
          aria-label="Send message"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Generating...
            </>
          ) : (
            'Send'
          )}
        </button>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </form>

      <div className="space-y-4">
        {messages.map((message) => (
          <Message key={message.id} message={message} input={input} />
        ))}
      </div>
    </div>
  );
}

function Message({ message, input }: MessageProps) {
  console.log("Message:", message);

  if (message.role === "assistant") {
    return (
      <>
        {message.toolInvocations?.length ? (
          message.toolInvocations.map((toolInvocation) => {
            if (
              toolInvocation.state === "result" &&
              toolInvocation.toolName === "tavilySearch"
            ) {
              const result = toolInvocation.result;
              console.log("Tool Result:", result);

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
                      <h2 className="text-lg font-semibold mb-4">
                        AI Analysis
                      </h2>
                      <BotMessage messages={[message]} />
                    </div>
                  )}
                </div>
              );
            }
            return null;
          })
        ) : (
          <div className="mt-6">
            <BotMessage messages={[message]} />
          </div>
        )}
      </>
    );
  }
  return null;
}
