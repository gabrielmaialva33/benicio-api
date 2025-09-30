import { inject } from '@adonisjs/core'
import OpenAI from 'openai'
import aiConfig from '#config/ai'
import logger from '@adonisjs/core/services/logger'
import BadRequestException from '#exceptions/bad_request_exception'

/**
 * NVIDIA NIM Client Service
 * OpenAI-compatible client for NVIDIA NIM API
 */
@inject()
export default class NvidiaNimClientService {
  private client: OpenAI

  constructor() {
    this.client = new OpenAI({
      apiKey: aiConfig.nvidia.apiKey,
      baseURL: aiConfig.nvidia.baseUrl,
    })
  }

  /**
   * Generate chat completion
   */
  async chat(params: {
    model?: string
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
    temperature?: number
    maxTokens?: number
    tools?: any[]
  }): Promise<{
    content: string
    tokens: number
    finishReason: string
    toolCalls?: any[]
  }> {
    try {
      const response = await this.client.chat.completions.create({
        model: params.model || aiConfig.models.default,
        messages: params.messages,
        temperature: params.temperature || 0.7,
        max_tokens: params.maxTokens || aiConfig.rateLimit.maxTokensPerRequest,
        tools: params.tools,
      })

      const choice = response.choices[0]

      return {
        content: choice.message.content || '',
        tokens: response.usage?.total_tokens || 0,
        finishReason: choice.finish_reason,
        toolCalls: choice.message.tool_calls,
      }
    } catch (error) {
      logger.error('NVIDIA NIM API error', { error })
      throw new BadRequestException(`AI generation failed: ${error.message}`)
    }
  }

  /**
   * Generate streaming chat completion
   */
  async *chatStream(params: {
    model?: string
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
    temperature?: number
    maxTokens?: number
  }): AsyncGenerator<string> {
    try {
      const stream = await this.client.chat.completions.create({
        model: params.model || aiConfig.models.default,
        messages: params.messages,
        temperature: params.temperature || 0.7,
        max_tokens: params.maxTokens || aiConfig.rateLimit.maxTokensPerRequest,
        stream: true,
      })

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content
        if (content) {
          yield content
        }
      }
    } catch (error) {
      logger.error('NVIDIA NIM streaming error', { error })
      throw new BadRequestException(`AI streaming failed: ${error.message}`)
    }
  }

  /**
   * Generate embeddings
   */
  async embeddings(text: string | string[]): Promise<number[][]> {
    try {
      const input = Array.isArray(text) ? text : [text]

      const response = await this.client.embeddings.create({
        model: aiConfig.embeddings.model,
        input,
      })

      return response.data.map((item) => item.embedding)
    } catch (error) {
      logger.error('NVIDIA NIM embeddings error', { error })
      throw new BadRequestException(`Embedding generation failed: ${error.message}`)
    }
  }
}
