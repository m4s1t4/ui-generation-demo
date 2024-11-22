import { z } from 'zod'
import { type Message, tool as createTool } from 'ai'

// Esquema base para mensajes de chat
export const ChatMessageSchema = z.object({
  id: z.string().optional(),
  role: z.enum(['user', 'assistant', 'system', 'function']),
  content: z.string(),
  name: z.string().optional(),
  function_call: z.any().optional()
})

export type ChatMessage = Message

// Esquema para los parámetros del investigador
export const researchSchema = z.object({
  query: z.string().describe('The query to research'),
  max_results: z.coerce
    .number()
    .default(8)
    .describe('The maximum number of results to return'),
  search_depth: z
    .enum(['basic', 'advanced'])
    .default('advanced')
    .describe(
      'The depth of the research. Allowed values are "basic" or "advanced"'
    ),
  include_domains: z
    .array(z.string())
    .optional()
    .describe('Domains to include in search'),
  exclude_domains: z
    .array(z.string())
    .optional()
    .describe('Domains to exclude from search')
})

export type ResearchParams = z.infer<typeof researchSchema>

// Esquema para los resultados de la investigación
export const ResearchResultSchema = z.object({
  query: z.string(),
  sources: z.array(z.object({
    title: z.string(),
    url: z.string(),
    content: z.string()
  })),
  answer: z.string(),
  images: z.array(z.object({
    url: z.string(),
    description: z.string()
  })),
  videos: z.array(z.object({
    url: z.string(),
    title: z.string(),
    thumbnailUrl: z.string().optional()
  })),
  relatedQuestions: z.array(z.string())
})

export type ResearchResult = z.infer<typeof ResearchResultSchema>

// Herramienta del investigador
export const researcherTool = createTool({
  description: 'Research and analyze information from multiple sources',
  parameters: researchSchema,
  execute: async function(params: ResearchParams) {
    const { query } = params
    return {
      query,
      sources: [],
      answer: 'Research results will be provided here',
      images: [],
      videos: [],
      relatedQuestions: []
    } satisfies ResearchResult
  }
})

// Esquema para la configuración del agente
export const AgentConfigSchema = z.object({
  model: z.string().default('gpt-4'),
  system: z.string().default('You are a helpful assistant'),
  messages: z.array(ChatMessageSchema),
  functions: z.record(z.any()).optional(),
  functionCall: z.enum(['auto', 'none']).default('auto'),
  temperature: z.number().default(0.7),
  stream: z.boolean().default(true)
})

export type AgentConfig = z.infer<typeof AgentConfigSchema>

// Esquema para la solicitud del chat
export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema),
  config: AgentConfigSchema.optional()
})

export type ChatRequest = z.infer<typeof ChatRequestSchema>

// Exportar las herramientas disponibles
export const tools = {
  researcher: researcherTool
} as const

export type Tools = typeof tools
