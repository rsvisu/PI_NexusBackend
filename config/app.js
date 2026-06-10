/**
 * Configuración de la aplicación
 */
import defaults from './defaults.js'

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
      embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
    }
  },

  chat: {
    rateLimitMax: defaults.rateLimitMax,  // Configurable por el admin

    rateLimitWindowSeconds: 60,
  },

  // Apariencia y comportamiento del widget público; configurable por el admin desde el dashboard
  widget: {
    // Mensaje de bienvenida: configurable por el admin
    greeting: defaults.greeting,
    // Sugerencias iniciales clicables: configurables por el admin; vacío = no se muestran
    suggestions: [],
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

/**
 * Aplica al objeto `config` en memoria los valores de configuración guardados en BD.
 * undefined = no tocar, null = volver al default.
 * @param {object} values
 * @param {number|null} [values.rate_limit_max]
 * @param {string|null} [values.openai_api_key]
 * @param {string|null} [values.greeting]
 * @param {string[]|null} [values.suggestions]
 */
export function applyRuntimeConfig({ rate_limit_max, openai_api_key, greeting, suggestions }) {
  if (rate_limit_max !== undefined) {
    config.chat.rateLimitMax = rate_limit_max !== null ? rate_limit_max : defaults.rateLimitMax
  }
  if (greeting !== undefined) {
    config.widget.greeting = greeting !== null ? greeting : defaults.greeting
  }
  if (suggestions !== undefined) {
    config.widget.suggestions = suggestions !== null ? suggestions : []
  }
  if (openai_api_key !== undefined) {
    // El .env tiene prioridad sobre la BD (pensado para pruebas en local)
    config.llm.openAI.apiKey = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY : openai_api_key
  }
}

export default config
