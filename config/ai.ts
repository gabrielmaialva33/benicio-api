import env from '#start/env'

export default {
  /*
  |--------------------------------------------------------------------------
  | NVIDIA NIM Configuration
  |--------------------------------------------------------------------------
  */
  nvidia: {
    apiKey: env.get('NVIDIA_NIM_API_KEY'),
    baseUrl: env.get('NVIDIA_NIM_BASE_URL', 'https://integrate.api.nvidia.com/v1'),
  },

  /*
  |--------------------------------------------------------------------------
  | AI Models Configuration
  |--------------------------------------------------------------------------
  */
  models: {
    default: env.get('AI_DEFAULT_MODEL', 'meta/llama-3.1-70b-instruct'),
    code: env.get('AI_CODE_MODEL', 'qwen/qwen3-coder-480b'),
    reasoning: env.get('AI_REASONING_MODEL', 'deepseek-ai/deepseek-r1'),
    fast: env.get('AI_FAST_MODEL', 'mistralai/mistral-7b-instruct-v0.3'),
  },

  /*
  |--------------------------------------------------------------------------
  | Embeddings Configuration
  |--------------------------------------------------------------------------
  */
  embeddings: {
    model: env.get('AI_EMBEDDING_MODEL', 'nvidia/nv-embedqa-e5-v5'),
    dimension: env.get('AI_EMBEDDING_DIMENSION', 1536),
  },

  /*
  |--------------------------------------------------------------------------
  | Cache & Rate Limiting
  |--------------------------------------------------------------------------
  */
  cache: {
    ttl: env.get('AI_CACHE_TTL', 3600), // 1 hour
  },

  rateLimit: {
    maxTokensPerRequest: env.get('AI_MAX_TOKENS_PER_REQUEST', 4096),
    maxRequestsPerMinute: env.get('AI_MAX_REQUESTS_PER_MINUTE', 60),
  },

  /*
  |--------------------------------------------------------------------------
  | RAG Configuration
  |--------------------------------------------------------------------------
  */
  rag: {
    chunkSize: env.get('RAG_CHUNK_SIZE', 1000),
    chunkOverlap: env.get('RAG_CHUNK_OVERLAP', 200),
    topK: env.get('RAG_TOP_K_RESULTS', 5),
    minConfidence: env.get('RAG_MIN_CONFIDENCE', 0.7),
  },
}
