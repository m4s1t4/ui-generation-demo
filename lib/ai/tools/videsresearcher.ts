import { tool as createTool } from 'ai'
import { z } from 'zod'

// Schema para los parámetros de búsqueda de videos
export const videoSearchSchema = z.object({
  query: z.string().describe('The query to search for videos'),
  max_results: z.coerce
    .number()
    .default(5)
    .describe('The maximum number of video results to return'),
  search_depth: z
    .enum(['basic', 'advanced'])
    .default('basic')
    .describe('The depth of the video search')
})

// Schema para la respuesta de Serper
const SerperVideoResult = z.object({
  title: z.string(),
  link: z.string(),
  snippets: z.array(z.string()).optional(),
  thumbnailUrl: z.string().optional(),
  thumbnail: z.string().optional(),
  duration: z.string().optional(),
  views: z.number().optional(),
  date: z.string().optional()
})

const SerperResponse = z.object({
  videos: z.array(SerperVideoResult),
  searchParameters: z.object({
    q: z.string()
  }).optional()
})

// Types
export type VideoSearchParams = z.infer<typeof videoSearchSchema>

// Main search function
async function searchVideos(params: VideoSearchParams) {
  try {
    const response = await fetch('https://google.serper.dev/videos', {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: params.query,
        num: params.max_results
      })
    })

    if (!response.ok) {
      throw new Error(`Video search API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const parsedData = SerperResponse.parse(data)

    return {
      videos: parsedData.videos.map(video => ({
        title: video.title,
        link: video.link,
        thumbnail: video.thumbnailUrl || video.thumbnail || '',
        duration: video.duration,
        views: video.views,
        date: video.date
      })),
      query: params.query
    }
  } catch (error) {
    console.error('Video Search Error:', error)
    throw error
  }
}

// Tool implementation
export const videoSearchTool = createTool({
  description: 'Search for videos from YouTube and other platforms',
  parameters: videoSearchSchema,
  execute: async function(params: VideoSearchParams) {
    try {
      const response = await searchVideos(params)

      // Generar el texto de respuesta para el modelo
      const videoList = response.videos
        .map(video => `🎥 [${video.title}](${video.link})`)
        .join('\n')

      return {
        content: `Found ${response.videos.length} videos about "${params.query}":\n\n${videoList}`,
        videos: response.videos
      }
    } catch (error) {
      console.error('Video Search Tool Error:', error)
      return {
        content: 'Sorry, I encountered an error while searching for videos.',
        videos: []
      }
    }
  }
})

// Export tools
export const tools = {
  videoSearch: videoSearchTool
} as const
