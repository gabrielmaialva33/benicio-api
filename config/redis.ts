import { defineConfig } from '@adonisjs/redis'
import { InferConnections } from '@adonisjs/redis/types'
import env from '#start/env'

const redisConfig = defineConfig({
  connection: 'main',

  connections: {
    /*
    |--------------------------------------------------------------------------
    | The default connection
    |--------------------------------------------------------------------------
    |
    | The main connection you want to use to execute redis commands. The same
    | connection will be used by the session provider, if you rely on the
    | redis driver.
    |
    */
    main: {
      host: env.get('REDIS_HOST'),
      port: env.get('REDIS_PORT'),
      password: env.get('REDIS_PASSWORD', 'redis'),
      db: 0,
      keyPrefix: '',
      retryStrategy(times) {
        return times > 10 ? null : times * 50
      },
    },

    /*
    |--------------------------------------------------------------------------
    | AI Cache connection
    |--------------------------------------------------------------------------
    |
    | Connection used for AI response caching, RAG results, and permission
    | caching. Uses DB 1 to separate AI cache from main application cache.
    |
    */
    ai_cache: {
      host: env.get('REDIS_HOST'),
      port: env.get('REDIS_PORT'),
      password: env.get('REDIS_PASSWORD', 'redis'),
      db: 1,
      keyPrefix: 'ai:cache:',
      retryStrategy(times) {
        return times > 10 ? null : times * 50
      },
    },

    /*
    |--------------------------------------------------------------------------
    | AI State connection
    |--------------------------------------------------------------------------
    |
    | Connection used for LangGraph conversation state management and
    | multi-agent orchestration state. Uses DB 2 to isolate state data.
    |
    */
    ai_state: {
      host: env.get('REDIS_HOST'),
      port: env.get('REDIS_PORT'),
      password: env.get('REDIS_PASSWORD', 'redis'),
      db: 2,
      keyPrefix: 'ai:state:',
      retryStrategy(times) {
        return times > 10 ? null : times * 50
      },
    },
  },
})

export default redisConfig

declare module '@adonisjs/redis/types' {
  export interface RedisConnections extends InferConnections<typeof redisConfig> {}
}
