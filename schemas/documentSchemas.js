import { z } from 'zod'

// # Esquemas:
const uploadSchema = z.object({
    // name no viene en el body (se toma de file.originalname desde multer)
    folder_id: z.coerce.number().int().positive().optional(), // <- optional admite hace que admita undefined
    expires_at: z.coerce.date().optional(),
})

// # Funciones validadoras:
// Cada una lanza ZodError si la entrada es inválida (lo captura el errorHandler)
class DocumentSchemas {
    static validateDocumentUpload(body) {
        return uploadSchema.parse(body)
    }
}

export default DocumentSchemas