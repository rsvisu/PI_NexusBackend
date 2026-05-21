import supabase from '../database/supabaseClient.js';

class Folder {

    static async getAll() {
        const { data, error } = await supabase
            .from('folders')
            .select('id, name, created_at, documents(count)')
            .order('created_at', { ascending: false })

        if (error) throw error

        // Transformamos el resultado porque devuelve algo como:
        // [{ id, name, created_at, documents: [{ count: 8 }] }]
        return data.map(folder => ({
            ...folder,
            documents_count: folder.documents[0].count
        }))
    }

    static async findById(id) {
        const { data, error } = await supabase
            .from('folders')
            .select('*')
            .eq('id', id)
            // maybeSingle() devuelve null si no encuentra nada
            .maybeSingle()

        if (error) throw error

        return data
    }

    static async create({ name }) {
        const { data, error } = await supabase
            .from('folders')
            .insert({ name })
            .select()
            .single()

        if (error) throw error

        return data
    }

    static async update(id, { name }) {
        const { data, error } = await supabase
            .from('folders')
            .update({ name })
            .eq('id', id)
            .select()
            .maybeSingle()

        if (error) throw error

        return data
    }

    /**
     * Borra una carpeta y devuelve la fila borrada, o null si no existía.
     * Los documentos que estuvieran dentro pasan a folder_id = NULL
     * por el ON DELETE SET NULL del schema
     *
     * @param {number} id - id de la carpeta a borrar
     * @returns {Promise<Object|null>} La carpeta borrada, o null si no existía
     */
    static async delete(id) {
        const { data, error } = await supabase
            .from('folders')
            .delete()
            .eq('id', id)
            .select()
            .maybeSingle()

        if (error) throw error

        return data
    }

}

export default Folder
