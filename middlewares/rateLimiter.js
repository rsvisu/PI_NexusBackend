import { rateLimit } from 'express-rate-limit'
import config from '../config/app.js'

const chatRateLimiter = rateLimit({
  windowMs: config.chat.rateLimitWindowSeconds * 1000, // convertir a milisegundos
  limit: config.chat.rateLimitMax,
  standardHeaders: 'draft-8', // 'draft-8' -> hace que Express envíe automáticamente las cabeceras RateLimit-Limit, RateLimit-Remaining y RateLimit-Reset en cada respuesta
  legacyHeaders: false,
  message: {
    error: 'Demasiadas peticiones. Por favor, espera un momento antes de continuar.'
  }
})

export { chatRateLimiter }