import supabase from '../database/supabaseClient.js';
import config from '../config/app.js';

// # Servicio:
// Encapsula las operaciones contra Supabase Storage para el bucket de
// documentos. Centralizar aquí el nombre del bucket evita repetir literales
// por el código y deja el controlador centrado en orquestar el flujo.
class StorageService {

    /**
     * Sube un archivo al bucket privado.
     *
     * @param {string} path - Ruta dentro del bucket (debe ser única)
     * @param {Buffer} buffer - Contenido del archivo en memoria
     * @param {string} contentType - mimetype original del archivo
     */
    static async upload(path, buffer, contentType) {
        // upsert: false evita pisar un archivo existente por accidente.
        // Si el path ya existe Supabase devuelve error y lo propagamos
        const { error } = await supabase.storage
            .from(config.storage.bucket)
            .upload(path, buffer, {
                contentType,
                upsert: false,
            });

        if (error) throw error;
    }

    /**
     * Borra un archivo del bucket.
     *
     * @param {string} path - Ruta del archivo dentro del bucket
     */
    static async remove(path) {
        // remove() acepta un array de paths
        const { error } = await supabase.storage
            .from(config.storage.bucket)
            .remove([path]);

        if (error) throw error;
    }

    /**
     * Genera una URL firmada temporal para descargar el archivo. Como el
     * bucket es privado, sin esta firma no se puede acceder al contenido.
     * La URL expira a los segundos indicados.
     *
     * @param {string} path - Ruta del archivo dentro del bucket
     * @param {number} expiresInSeconds - Tiempo de validez de la URL
     * @returns {Promise<string>} La URL firmada
     */
    static async getSignedUrl(path, expiresInSeconds) {
        const { data, error } = await supabase.storage
            .from(config.storage.bucket)
            .createSignedUrl(path, expiresInSeconds);

        if (error) throw error;

        return data.signedUrl;
    }

}

export default StorageService;
