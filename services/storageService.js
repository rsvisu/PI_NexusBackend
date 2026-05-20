import supabase from '../database/supabaseClient.js';
import config from '../config/app.js';

// # Servicio:
class StorageService {

    /**
     * Sube un archivo al bucket privado
     *
     * @param {string} path - Ruta dentro del bucket (único)
     * @param {Buffer} buffer - Contenido del archivo en memoria
     * @param {string} contentType - mimetype original del archivo
     */
    static async upload(path, buffer, contentType) {
        const { error } = await supabase.storage
            .from(config.storage.bucket)
            .upload(path, buffer, {
                contentType,
                upsert: false, // evita sobreescribir un archivo existente por accidente
            });

        if (error) throw error;
    }

    /**
     * Borra un archivo del bucket
     *
     * @param {string} path - Ruta del archivo dentro del bucket
     */
    static async remove(path) {
        const { error } = await supabase.storage
            .from(config.storage.bucket)
            .remove([path]); // remove() acepta un array de paths

        if (error) throw error;
    }

    /**
     * Genera una URL firmada temporal para descargar el archivo
     * La URL expira a los segundos configurados
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
