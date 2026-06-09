import { rateLimit } from 'express-rate-limit'
import config from '../config/app.js'

const chatRateLimiter = rateLimit({
  windowMs: config.chat.rateLimitWindowSeconds * 1000,
  // Función para leer el valor actual en cada request; así el dashboard puede cambiarlo sin reiniciar
  limit: () => config.chat.rateLimitMax,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: 'Demasiadas peticiones. Por favor, espera un momento antes de continuar.'
  }
})

export { chatRateLimiter }