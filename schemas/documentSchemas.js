import { z } from 'zod'

// # Esquemas:
const uploadSchema = z.object({
    // name no viene en el body (se toma de file.originalname desde multer)
    folder_id: z.coerce.number().int().positive().optional(), // <- optional admite hace que admita undefined
    expires_at: z.coerce.date().optional(),
})

const updateSchema = z.object({
    name: z.string().trim().min(1, "El nombre no puede estar vacío").optional(),
    folder_id: z.coerce.number().int().positive().nullable().optional(),
    expires_at: z.coerce.date().nullable().optional(),
})

const toggleActiveSchema = z.object({
    is_active: z.boolean(),
})

const idParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
})

// # Funciones validadoras:
// Cada una lanza ZodError si la entrada es inválida (lo captura el errorHandler)
class DocumentSchemas {
    static validateDocumentUpload(body) {
        return uploadSchema.parse(body)
    }

    static validateDocumentUpdate(body) {
        return updateSchema.parse(body)
    }

    static validateDocumentToggleActive(body) {
        return toggleActiveSchema.parse(body)
    }

    static validateId(params) {
        return idParamsSchema.parse(params)
    }
}

export default DocumentSchemas