import consola from 'consola'
import { ZodError } from 'zod'
import AppError from '../errors/AppError.js'

function errorHandler(err, req, res, _next) {
    // Error esperado: lo lanzamos nosotros con AppError
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ error: err.message })
    }

    // Error de validación de Zod: lo traduciomos a error 400 y mandamos el mensaje con solo el primer issue
    if (err instanceof ZodError) {
        const firstIssue = err.issues[0]
        const path = firstIssue.path.join('.')
        // Mensaje:
        let message
        if (path) {
            message = `${path}: ${firstIssue.message}`
        } else {
            message = firstIssue.message
        }
        // Return:
        return res.status(400).json({ error: message })
    }

    // Error inesperado: fallo de base de datos, bug, etc
    consola.error(err)
    return res.status(500).json({
        error: "Lo siento, tengo problemas de conexión ahora mismo"
    })
}

export default errorHandler