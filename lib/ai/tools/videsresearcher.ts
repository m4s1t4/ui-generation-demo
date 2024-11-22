import { tool as createTool } from 'ai'
import { z } from 'zod'

// Interfaz para la respuesta de Serper
interface SerperVideo {
  title: string
  link: string
  thumbnail: string
  duration?: string
  views?: number
  date?: string
}

// Schema para los parámetros de búsqueda de videos
export const videoSearchSchema = z.object({
  query: z.string().describe('The query to search for videos'),
  max_results: z.coerce
    .number()
    .default(5)
    .describe('The maximum number of video results to return')
})

// Schema para los resultados de videos
const VideoResult = z.object({
  title: z.string(),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  duration: z.string().optional(),
  platform: z.string(),
  views: z.number().optional(),
  publishedDate: z.string().optional()
})

const VideoSearchResponse = z.object({
  results: z.array(VideoResult),
  query: z.string(),
  totalResults: z.number().optional()
})

// Types
type VideoSearchParams = z.infer<typeof videoSearchSchema>
type VideoSearchResponse = z.infer<typeof VideoSearchResponse>

// Main search function
async function searchVideos({
  query,
  max_results = 5
}: VideoSearchParams): Promise<VideoSearchResponse> {
  try {
    const response = await fetch('https://google.serper.dev/videos', {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: query,
        num: max_results
      })
    })

    if (!response.ok) {
      throw new Error(`Video search API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return VideoSearchResponse.parse({
      results: (data.videos as SerperVideo[]).map(video => ({
        title: video.title,
        url: video.link,
        thumbnailUrl: video.thumbnail,
        platform: 'youtube',
        duration: video.duration,
        views: video.views,
        publishedDate: video.date
      })),
      query,
      totalResults: data.videos.length
    })
  } catch (error) {
    console.error('Video Search Error:', error)
    throw error
  }
}

// Tool implementation
export const videoSearchTool = createTool({
  description: 'Search for videos from YouTube',
  parameters: videoSearchSchema,
  execute: async function({ query, max_results = 5 }) {
    try {
      const response = await searchVideos({
        query,
        max_results
      })

      return {
        query,
        videos: response.results.map(video => ({
          title: video.title,
          url: video.url,
          thumbnailUrl: video.thumbnailUrl,
          duration: video.duration,
          platform: video.platform
        })),
        totalResults: response.totalResults
      }
    } catch (error) {
      console.error('Video Search Tool Error:', error)
      return {
        query,
        videos: [],
        totalResults: 0,
        error: 'Failed to fetch video results'
      }
    }
  }
})

// Export tools
export const tools = {
  videoSearch: videoSearchTool
} as const
