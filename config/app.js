/**
 * Configuración de la aplicación
 */
const config = {
  app: {
    port: parseInt(process.env.PORT ?? '3000'),
    allowedOrigins: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
      : null // null -> CORS abierto en desarrollo
  },
  llm: {
    openAI: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
    }
  },
  chat: {
    rateLimitMax: parseInt(process.env.CHAT_RATE_LIMIT_MAX ?? '10'),
    rateLimitWindowSeconds: 60,
  },
}

export default config
