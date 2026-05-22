import supabase from '../database/supabaseClient.js';

class Document {

    /**
     * Recupera todos los documentos, ordenados por fecha de creación descendente.
     * 
     * @returns {Promise<Array>} Array de documentos
     */
    static async getAll() {
        const { data, error } = await supabase
            .from('documents')
            .select('id, folder_id, name, source_type, source_uri, is_active, expires_at, created_at')
            .order('created_at', { ascending: false })

        if (error) throw error

        return data
    }

    static async findById(id) {
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('id', id)
            .maybeSingle()  // <- devuelve null si no encuentra nada

        if (error) throw error

        return data
    }

    static async create({ name, source_type, source_uri, folder_id, expires_at }) {
        const { data, error } = await supabase
            .from('documents')
            .insert({ name, source_type, source_uri, folder_id, expires_at })
            .select()
            .single() // <- solo no da error si se devuelve exactamente una fila

        if (error) throw error

        return data
    }

    /**
     * Actualiza nombre, carpeta y fecha de expiración de un documento.
     * Los campos no incluidos en el objeto (undefined) no se actualizan.
     * folder_id = null mueve el documento a 'sin clasificar'.
     * expires_at = null elimina la fecha de expiración.
     *
     * @param {number} id
     * @param {*} fields
     * @returns {Promise<Object|null>}
     */
    static async update(id, { name, folder_id, expires_at }) {
        const { data, error } = await supabase
            .from('documents')
            .update({ name, folder_id, expires_at })
            .eq('id', id)
            .select()
            .maybeSingle()

        if (error) throw error

        return data
    }

    /**
     * Activa o desactiva un documento.
     * 
     * @param {number} id - ID del documento a modificar
     * @param {boolean} is_active - Boolean que indica si el documento debe quedar activo o inactivo
     * @returns
     */
    static async setActive(id, is_active) {
        const { data, error } = await supabase
            .from('documents')
            .update({ is_active })
            .eq('id', id)
            .select()
            .maybeSingle()

        if (error) throw error

        return data
    }

    /**
     * Borra un documento y devuelve la fila borrada, o null si no existía.
     * Sus chunks se borran por el ON DELETE CASCADE.
     *
     * @param {number} id - id  del documento a borrar
     * @returns {Promise<Object|null>} El documento borrado, o null si no existía
     */
    static async delete(id) {
        const { data, error } = await supabase
            .from('documents')
            .delete()
            .eq('id', id)
            .select()
            .maybeSingle()

        if (error) throw error

        return data
    }

}

export default Document
