import { z } from 'zod'

// # Esquemas:
const updateSchema = z.object({
    // JSON body
    // number = nuevo límite, null = borrarlo (usar default), ausente = no tocarlo
    rate_limit_max: z.number().int().min(1, 'El mínimo es 1').max(1000, 'El máximo es 1000').nullable().optional(),
    // string = nueva clave, null = borrarla, ausente = no tocarla
    openai_api_key: z.string().trim().min(1, 'La API key no puede estar vacía').nullable().optional(),
    // string = nuevo saludo, null = borrarlo (usar default), ausente = no tocarlo
    greeting: z.string().trim().min(1, 'El saludo no puede estar vacío').max(500, 'El saludo no puede superar los 500 caracteres').nullable().optional(),
})

// # Funciones validadoras:
class ConfigSchemas {
    static validateUpdate(body) {
        return updateSchema.parse(body)
    }
}

export default ConfigSchemas