import SystemConfig from '../models/SystemConfig.js'
import AppError from '../errors/AppError.js'
import ConfigSchemas from '../schemas/configSchemas.js'
import config, { applyRuntimeConfig } from '../config/app.js'
import defaults from '../config/defaults.js'

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
      openai_api_key_set: saved.openai_api_key !== null,
      greeting: saved.greeting,
      suggestions: saved.suggestions,
      system_prompt: saved.system_prompt,
      defaults: {
        rate_limit_max: defaults.rateLimitMax,
        greeting: defaults.greeting,
      }
    })
  }

  /**
   * Configuración que el widget necesita al arrancar.
   * Endpoint público, por eso solo expone campos no sensibles.
   * @param {*} req
   * @param {*} res
   * @returns
   */
  static async getPublicConfig(req, res) {
    // Saludo y sugerencias ya están resueltos (BD o default) en el config en memoria
    return res.json({
      greeting: config.widget.greeting,
      suggestions: config.widget.suggestions,
    })
  }

  static async updateConfig(req, res) {
    // ## Variables:
    const { rate_limit_max, openai_api_key, greeting, suggestions, system_prompt } = ConfigSchemas.validateUpdate(req.body)

    // ## Lógica:
    // Validamos solo si viene una clave nueva; null la borra y undefined no la toca
    if (openai_api_key) {
      await validateOpenAIKey(openai_api_key)
    }

    const updated = await SystemConfig.update({ rate_limit_max, openai_api_key, greeting, suggestions, system_prompt })

    // Reflejamos los cambios en el config en memoria para que rateLimiter, llmService y el widget los lean
    applyRuntimeConfig({ rate_limit_max, openai_api_key, greeting, suggestions, system_prompt })

    // ## Return:
    return res.json({
      rate_limit_max: updated.rate_limit_max,
      openai_api_key_set: updated.openai_api_key !== null,
      greeting: updated.greeting,
      suggestions: updated.suggestions,
      system_prompt: updated.system_prompt,
      defaults: {
        rate_limit_max: defaults.rateLimitMax,
        greeting: defaults.greeting,
      }
    })
  }
}

export default ConfigController
