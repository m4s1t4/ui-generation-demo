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
    .enum(['basic', 'advanced'])
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

const VideoResult = z.object({
  title: z.string(),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  duration: z.string().optional(),
  source: z.string() // e.g., "YouTube", "Vimeo"
})

const TavilySearchResponse = z.object({
  results: z.array(TavilySearchResult),
  query: z.string(),
  images: z.array(z.string()).optional(),
  videos: z.array(VideoResult).optional(), // Nuevo campo para videos
  relatedQuestions: z.array(z.object({
    text: z.string(),
    url: z.string()
  })).optional()
})

// Types
type TavilySearchParams = z.infer<typeof searchSchema>
type TavilySearchResponse = z.infer<typeof TavilySearchResponse>

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
        include_answer: true,
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

      // Procesar las imágenes para el formato requerido
      const processedImages = response.images?.map(url => ({
        url,
        description: 'Search result image' // Descripción por defecto
      })) || []

      return {
        query,
        images: processedImages,
        sources: response.results.map(result => ({
          title: result.title,
          url: result.url,
          content: result.content
        })),
        answer: response.answer || 'No direct answer available',
        relatedQuestions: response.relatedQuestions || []
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
