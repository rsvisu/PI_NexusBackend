import supabase from '../database/supabaseClient.js'

class SystemConfig {
  // Siempre hay una sola fila (id = 1), así que usamos .single()
  static async get() {
    const response = await supabase
      .from('system_config')
      .select('*')
      .single()
    if (response.error) throw response.error
    return response.data
  }

  /**
   * Actualiza los campos indicados. Los campos undefined no se tocan en BD.
   * @param {object} options
   * @param {number} [options.rate_limit_max]
   * @param {string|null} [options.openai_api_key] - null borra la clave guardada
   * @param {string|null} [options.greeting] - saludo inicial del widget; null borra el guardado
   * @param {string[]|null} [options.suggestions] - sugerencias del widget; null las borra
   * @param {string|null} [options.system_prompt] - prompt de sistema del LLM; null restaura el default
   */
  static async update({ rate_limit_max, openai_api_key, greeting, suggestions, system_prompt }) {
    const fields = { updated_at: new Date().toISOString() }

    if (rate_limit_max !== undefined) fields.rate_limit_max = rate_limit_max
    if (openai_api_key !== undefined) fields.openai_api_key = openai_api_key
    if (greeting !== undefined) fields.greeting = greeting
    if (suggestions !== undefined) fields.suggestions = suggestions
    if (system_prompt !== undefined) fields.system_prompt = system_prompt

    const response = await supabase
      .from('system_config')
      .update(fields)
      .eq('id', 1)
      .select()
      .single()
    if (response.error) throw response.error
    return response.data
  }
}

export default SystemConfig
