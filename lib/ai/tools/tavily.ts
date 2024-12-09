import { tool as createTool } from 'ai'
import { z } from 'zod'
import { TavilySearchAPIError } from "./errors"

// Schema para los parámetros de búsqueda
export const searchSchema = z.object({
  query: z.string().describe('The query to search for'),
  max_results: z.coerce
    .number()
    .describe('The maximum number of results to return'),
  search_depth: z
    .enum(['advanced'])
    .describe(
      'The depth of the search. Allowed values are "basic" or "advanced"'
    ),
  include_domains: z
    .array(z.string())
    .optional()
    .describe(
      'A list of domains to specifically include in the search results. Default is None, which includes all domains.'
    ),
  exclude_domains: z
    .array(z.string())
    .optional()
    .describe(
      "A list of domains to specifically exclude from the search results. Default is None, which doesn't exclude any domains."
    )
})

const TavilySearchResult = z.object({
  title: z.string(),
  url: z.string().url(),
  content: z.string(),
  score: z.number().optional(),
  publishedDate: z.string().optional(),
  imageUrl: z.string().url().optional()
})


const TavilySearchResponse = z.object({
  results: z.array(TavilySearchResult),
  query: z.string(),
  images: z.array(z.string()).optional(),
  relatedQuestions: z.array(z.object({
    text: z.string(),
    url: z.string()
  })).optional()
})

// Types
export type TavilySearchParams = z.infer<typeof searchSchema>
export type TavilySearchResponse = z.infer<typeof TavilySearchResponse>

// Main search function
async function searchWithTavily({
  query,
  max_results = 8,
  search_depth = 'advanced',
  include_domains,
  exclude_domains
}: TavilySearchParams): Promise<TavilySearchResponse> {
  if (!process.env.TAVILY_API_KEY)
    throw new TavilySearchAPIError('TAVILY_API_KEY is not configured')

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TAVILY_API_KEY}`
      },
      body: JSON.stringify({
        query,
        max_results,
        search_depth,
        include_domains,
        exclude_domains,
        include_images: true,
        include_raw_content: true
      })
    })

    if (!response.ok) {
      throw new TavilySearchAPIError(
        `Tavily API error: ${response.status} ${response.statusText}`
      )
    }

    const data = await response.json()
    console.log('Raw Tavily Response:', data)
    return TavilySearchResponse.parse(data)
  } catch (error) {
    console.error('Tavily Search Error:', error)
    if (error instanceof z.ZodError) {
      throw new TavilySearchAPIError(
        `Validation error: ${error.errors.map(e => e.message).join(', ')}`
      )
    }
    if (error instanceof Error) {
      throw new TavilySearchAPIError(error.message)
    }
    throw new TavilySearchAPIError('An unknown error occurred')
  }
}

// Tool implementation for AI SDK
export const tavilyTool = createTool({
  description: 'Search the internet for current information using Tavily Search API',
  parameters: searchSchema,
  execute: async function searchExecute({
    query,
    max_results = 8,
    search_depth = 'advanced',
    include_domains,
    exclude_domains
  }: TavilySearchParams) {
    try {
      const response = await searchWithTavily({
        query,
        max_results,
        search_depth,
        include_domains,
        exclude_domains
      })

      // Formatear los resultados de búsqueda
      const formattedResults = response.results
        .map(result => `🔍 [${result.title}](${result.url})\n${result.content}`)
        .join('\n\n')

      // Formatear las imágenes
      const formattedImages = response.images
        ? response.images.map(url => `![Search result image](${url})`).join('\n')
        : ''

      // Combinar resultados y imágenes
      return {
        content: `### Resultados de búsqueda para "${query}"\n\n${formattedResults}\n\n${formattedImages ? '### Imágenes relacionadas\n\n' + formattedImages : ''}`
      }
    } catch (error) {
      console.error('Tavily Tool Error:', error)
      if (error instanceof Error) {
        throw new TavilySearchAPIError(error.message)
      }
      throw new TavilySearchAPIError('An unknown error occurred')
    }
  }
})

// Export tools
export const tools = {
  tavilySearch: tavilyTool
}
