/**
 * Configuración de la aplicación
 */
const config = {
  // Configuración general de la aplicación
  app: {
    // Puerto de escucha del servidor
    port: parseInt(process.env.PORT || '3000'),

    // Origins permitidos para CORS, separados por comas en la variable de entorno
    allowedOrigins: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
      : null // null -> CORS abierto en desarrollo
  },

  // Configuración de LLM y embeddings
  llm: {
    openAI: {
      apiKey: process.env.OPENAI_API_KEY,
      chatModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      embeddingModel: process.env.OPENAI_MODEL || 'text-embedding-3-small',
    }
  },

  chat: {
    // Configuración del rate limiter de la ruta de chat
    rateLimitMax: parseInt(process.env.CHAT_RATE_LIMIT_MAX || '10'),
    rateLimitWindowSeconds: 60,
  },

  // Configuración de subida de documentos
  upload: {
    maxSizeMb: parseInt(process.env.UPLOAD_MAX_SIZE_MB || '5'), // 5MB por defecto
    allowedMimeTypes: ['application/pdf', 'text/plain', 'text/markdown']
  },

  // Configuración de Supabase Storage para los archivos originales
  storage: {
    // Bucket privado en Supabase Storage donde se guardan los archivos originales
    bucket: 'documents',

    // Tiempo de validez de las URLs firmadas para descargar (en segundos)
    signedUrlExpirySeconds: 60
  }
}

export default config
