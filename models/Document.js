import supabase from '../database/supabaseClient.js';

class Document {

    static async getAll() {
        // Listamos todos los documentos, los más nuevos primero
        const { data, error } = await supabase
            .from('documents')
            .select('id, name, source_type, source_uri, is_active, expires_at, created_at')
            .order('created_at', { ascending: false })

        if (error) throw error

        return data
    }

    static async findById(id) {
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('id', id)
            // maybeSingle() devuelve null si no encuentra nada
            .maybeSingle()

        if (error) throw error

        return data
    }

    static async create({ name, sourceType, sourceUri }) {
        const { data, error } = await supabase
            .from('documents')
            .insert({
                name,
                source_type: sourceType,
                source_uri: sourceUri,
            })
            .select()
            .single()

        if (error) throw error

        return data
    }
    
    static async setActive(id, isActive) {
        const { data, error } = await supabase
            .from('documents')
            .update({ is_active: isActive })
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
