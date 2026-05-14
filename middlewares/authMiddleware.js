import supabase from '../database/supabaseClient.js';
import AppError from '../errors/AppError.js';

/**
 * Verifica el access token de Supabase enviado en el header
 * `Authorization: Bearer <token>`.
 *
 * Si el token es válido, adjunta el usuario a `req.user` y deja pasar.
 *
 * Usamos `supabase.auth.getUser(token) porque además de validar la firma,
 * comprueba que la sesión no haya sido revocada (por ejemplo, si el usuario 
 * cerró sesión desde otro dispositivo).
 */
async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError('No autorizado', 401);
    }

    const token = authHeader.split(' ')[1];

    const response = await supabase.auth.getUser(token);
    const user = response.data.user;
    const error = response.error;

    if (error || !user) {
        throw new AppError('Token inválido o expirado', 401);
    }

    req.user = user;
    next();
}

export default authMiddleware;
