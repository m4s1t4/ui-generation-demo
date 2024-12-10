import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { tools } from "@/lib/ai/tools/tavily";
import { TavilySearchAPIError } from "@/lib/ai/tools/errors";

interface ToolCall {
  name: string;
  arguments: {
    query: string;
    max_results: number;
    search_depth: "advanced";
    include_domains?: string[];
    exclude_domains?: string[];
  };
}

const SYSTEM_PROMPT = `You are a helpful AI assistant with access to web search capabilities.
When a user asks for current information or facts that might need verification, use the tavilySearch tool to find accurate information.
Always provide your response in a clear and structured way using Markdown formatting.

Guidelines:
1. First, analyze the search results thoroughly
2. Then, provide a comprehensive response that:
   - Synthesizes the information from multiple sources
   - Highlights key findings and trends
   - Provides context and explanations
   - References specific sources when making claims

3. Format your response using Markdown:
   - Use ## for main sections
   - Use ### for subsections
   - Use * for bullet points
   - Use ** for important concepts
   - Use > for quotes or important highlights
   - Use ![alt text](image_url) for images
   - Use [Video Title](video_url) for videos

4. Structure your analysis:
   - Start with a brief overview
   - Present main findings
   - Discuss implications
   - End with a conclusion

5. When relevant:
   - Compare different perspectives
   - Highlight recent developments
   - Explain technical concepts
   - Provide real-world examples
   - Include relevant images and videos to enhance the explanation

Remember: Your role is to analyze and explain the information found, not just summarize it.`;

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    console.log("Incoming Messages:", messages);

    const result = streamText({
      model: openai("gpt-4o"),
      system: SYSTEM_PROMPT,
      messages,
      maxSteps: 5,
      tools,
      temperature: 0.1,
      toolChoice: "auto",
      onToolCall: async (toolCall: ToolCall) => {
        console.log("Tool Call:", toolCall);
        try {
          if (toolCall.name in tools) {
            const args = {
              ...toolCall.arguments,
              max_results: toolCall.arguments.max_results || 8,
              search_depth: toolCall.arguments.search_depth || "advanced",
            };

            const result =
              await tools[toolCall.name as keyof typeof tools].execute(args);
            console.log("Tool Result:", result);

            return {
              ...result,
              answer: result.answer,
            };
          }
          throw new TavilySearchAPIError(`Unknown tool: ${toolCall.name}`);
        } catch (error) {
          console.error("Tool Error:", error);
          throw error;
        }
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
