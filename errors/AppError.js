/**
 * Error personalizado para respuestas HTTP con información para el usuario.
 * 
 * Se debe usar para devolver un error con un mensaje legible (validaciones,
 * recursos no encontrados, etc.). El mensaje se enviará directamente al cliente,
 * por lo que nunca debe contener trazas internas ni detalles técnicos.
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

export default AppError;
