import consola from 'consola';
import AppError from '../errors/AppError.js';

function errorHandler(err, req, res, next) {

    // Error esperado: lo lanzamos nosotros con AppError
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ error: err.message });
    }

    // Error inesperado: fallo de base de datos, bug, etc
    consola.error(err);
    return res.status(500).json({
        error: "Lo siento, tengo problemas de conexión ahora mismo"
    });
}

export default errorHandler;
