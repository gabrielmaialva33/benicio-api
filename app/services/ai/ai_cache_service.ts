import { inject } from '@adonisjs/core'
import redis from '@adonisjs/redis/services/main'
import aiConfig from '#config/ai'
import logger from '@adonisjs/core/services/logger'
import crypto from 'node:crypto'

/**
 * AI Cache Service
 * Uses Redis ai_cache connection for caching AI responses and RAG results
 */
@inject()
export default class AiCacheService {
  /**
   * Generate cache key from input
   */
  private generateKey(prefix: string, input: string | Record<string, any>): string {
    const content = typeof input === 'string' ? input : JSON.stringify(input)
    const hash = crypto.createHash('sha256').update(content).digest('hex')
    return `${prefix}:${hash}`
  }

  /**
   * Get cached response
   */
  async get<T = any>(prefix: string, input: string | Record<string, any>): Promise<T | null> {
    try {
      const key = this.generateKey(prefix, input)
      const redisClient = await redis.connection('ai_cache')
      const cached = await redisClient.get(key)

      if (cached) {
        logger.debug('AI cache hit', { prefix, key })
        return JSON.parse(cached) as T
      }

      logger.debug('AI cache miss', { prefix, key })
      return null
    } catch (error) {
      logger.error('AI cache get error', { error, prefix })
      return null
    }
  }

  /**
   * Set cached response
   */
  async set(
    prefix: string,
    input: string | Record<string, any>,
    value: any,
    ttl?: number
  ): Promise<void> {
    try {
      const key = this.generateKey(prefix, input)
      const redisClient = await redis.connection('ai_cache')
      const ttlSeconds = ttl || aiConfig.cache.ttl

      await redisClient.setex(key, ttlSeconds, JSON.stringify(value))

      logger.debug('AI cache set', { prefix, key, ttl: ttlSeconds })
    } catch (error) {
      logger.error('AI cache set error', { error, prefix })
    }
  }

  /**
   * Delete cached response
   */
  async delete(prefix: string, input: string | Record<string, any>): Promise<void> {
    try {
      const key = this.generateKey(prefix, input)
      const redisClient = await redis.connection('ai_cache')
      await redisClient.del(key)

      logger.debug('AI cache deleted', { prefix, key })
    } catch (error) {
      logger.error('AI cache delete error', { error, prefix })
    }
  }

  /**
   * Clear all cache with specific prefix
   */
  async clearPrefix(prefix: string): Promise<void> {
    try {
      const redisClient = await redis.connection('ai_cache')
      const pattern = `${prefix}:*`
      const keys = await redisClient.keys(pattern)

      if (keys.length > 0) {
        await redisClient.del(...keys)
        logger.info('AI cache cleared', { prefix, count: keys.length })
      }
    } catch (error) {
      logger.error('AI cache clear error', { error, prefix })
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    keys: number
    memory: string
    hits: number
    misses: number
  }> {
    try {
      const redisClient = await redis.connection('ai_cache')
      const info = await redisClient.info('stats')
      const dbSize = await redisClient.dbsize()

      // Parse Redis INFO stats
      const stats = info.split('\r\n').reduce(
        (acc, line) => {
          const [key, value] = line.split(':')
          if (key && value) acc[key] = value
          return acc
        },
        {} as Record<string, string>
      )

      return {
        keys: dbSize,
        memory: stats['used_memory_human'] || '0',
        hits: Number.parseInt(stats['keyspace_hits'] || '0'),
        misses: Number.parseInt(stats['keyspace_misses'] || '0'),
      }
    } catch (error) {
      logger.error('AI cache stats error', { error })
      return { keys: 0, memory: '0', hits: 0, misses: 0 }
    }
  }
}
