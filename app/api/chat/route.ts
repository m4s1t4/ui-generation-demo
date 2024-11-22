import { openai } from '@ai-sdk/openai'
// import { xai } from '@ai-sdk/xai';
import { streamText, type Message } from 'ai'
import { tools as tavilyTools } from '@/lib/ai/tools/tavily'
import { tools as videoTools } from '@/lib/ai/tools/videsresearcher'
import { ChatRequestSchema } from '@/lib/ai/agents/agentsscehmas'
import { type CoreMessage } from 'ai'
import { type TavilySearchParams } from '@/lib/ai/tools/tavily'
import { type VideoSearchParams } from '@/lib/ai/tools/videsresearcher'

const SYSTEM_PROMPT = `You are an advanced AI assistant with access to web search and video search capabilities.
When users ask for information that requires internet search, use both tavilySearch and videoSearch to provide comprehensive answers. If the question does not require internet search, provide a concise answer without images or videos.

If you going to performe a werb search it's important to follow this workflow:
1. You must use tavilySearch in firts place to perform the werbsearches
2. Once the search has been completed, use videoSearch to obtain videos that provide usefull information
3. Then when you have all this information you can respond with the established structure

Your responses MUST follow this EXACT structure and style:

### **Introducción**
Provide a brief, engaging overview (2-3 sentences) that:
- Introduces the main topic clearly
- Captures the reader's interest
- Highlights why this topic is important or relevant

Break down the information into clear, focused subsections:

##### Relevant Subsection Title
- Present key information in clear, concise points
- Include relevant statistics or data
- Add quotes when relevant: > "exact quote" - Source

##### Another Relevant Subsection Title
- Continue with organized, logical flow
- Ensure each point connects to the main topic
- Use bullet points for lists
- Keep explanations clear and direct

### **Imágenes y Videos**
Present multimedia content with clear context only when internet search is involved:

For images:
![](imageUrl)
- Point out key elements to notice

For videos:
[Video Title](videoUrl)
- Connect the video to the topic discussed

### **Conclusión**
Wrap up with:
- A clear summary of the main points
- The most important takeaways
- Any practical applications or next steps
- Final thoughts that tie everything together

Remember:
- Keep language clear and direct
- Use specific examples
- Make multimedia content relevant and meaningful
- Maintain a logical flow throughout
- Focus on practical understanding
- For videos, ALWAYS use the format: [Video Title](videoUrl)
- Don't use <u> underline</u> to underline titles and important things `

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { messages } = ChatRequestSchema.parse(body)

    console.log('Incoming Messages:', messages)

    const result = await streamText({
      model: openai('gpt-4o'),
      messages: messages as Message[],
      system: SYSTEM_PROMPT,
      temperature: 0.7,
      tools: {
        tavilySearch: {
          ...tavilyTools.tavilySearch,
          execute: async (args: TavilySearchParams) => {
            console.log('Executing tavilySearch:', args)
            const result = await tavilyTools.tavilySearch.execute(args, {
              messages: messages as CoreMessage[]
            })
            return result
          }
        },
        videoSearch: {
          ...videoTools.videoSearch,
          execute: async (args: VideoSearchParams) => {
            console.log('Executing videoSearch:', args)
            const result = await videoTools.videoSearch.execute(args, {
              messages: messages as CoreMessage[]
            })
            return result
          }
        }
      },
      toolChoice: "auto",
      maxSteps: 5
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Chat API Error:', error)
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
