import SystemConfig from '../models/SystemConfig.js'
import AppError from '../errors/AppError.js'
import ConfigSchemas from '../schemas/configSchemas.js'
import config from '../config/app.js'

/**
 * Verifica que una API key es válida llamando al endpoint más barato de OpenAI.
 * GET /v1/models no consume tokens, solo comprueba que la clave tiene permisos.
 *
 * @param {string} api_key - La clave a verificar
 * @throws {AppError} 400 si la clave no es válida o no tiene permisos
 */
async function validateOpenAIKey(api_key) {
  const response = await fetch('https://api.openai.com/v1/models', {
    headers: { Authorization: `Bearer ${api_key}` }
  })
  if (!response.ok) {
    throw new AppError('La API key no es válida o no tiene permisos suficientes', 400)
  }
}

class ConfigController {
  static async getConfig(req, res) {
    // ## Variables:
    const saved = await SystemConfig.get()

    // ## Return:
    // La API key no se devuelve nunca; solo indicamos si hay una configurada
    return res.json({
      rate_limit_max: saved.rate_limit_max,
      openai_api_key_set: saved.openai_api_key !== null
    })
  }

  static async updateConfig(req, res) {
    // ## Variables:
    const { rate_limit_max, openai_api_key } = ConfigSchemas.validateUpdate(req.body)

    // ## Lógica:
    // Validamos solo si viene una clave nueva; null la borra y undefined no la toca
    if (openai_api_key) {
      await validateOpenAIKey(openai_api_key)
    }

    const updated = await SystemConfig.update({ rate_limit_max, openai_api_key })

    // Mutamos config en memoria para que rateLimiter y llmService los lean en el siguiente request
    if (rate_limit_max !== undefined) {
      config.chat.rateLimitMax = rate_limit_max
    }
    if (openai_api_key !== undefined) {
      config.llm.openAI.apiKey = openai_api_key
      // Sobreescribimos la clave si existe en el .env
      if (process.env.OPENAI_API_KEY) {
        config.llm.openAI.apiKey = process.env.OPENAI_API_KEY
      }
    }

    // ## Return:
    return res.json({
      rate_limit_max: updated.rate_limit_max,
      openai_api_key_set: updated.openai_api_key !== null
    })
  }
}

export default ConfigController
