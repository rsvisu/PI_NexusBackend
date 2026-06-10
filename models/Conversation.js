import supabase from '../database/supabaseClient.js';

class Conversation {

    static async find(conversation_token) {
        const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('conversation_token', conversation_token)
            // maybeSingle() devuelve null si no encuentra nada
            .maybeSingle()

        if (error) throw error


        return data
    }

    static async findOrCreate(conversation_token) {
        // Buscamos si ya existe una conversación con ese token
        const existing = await this.find(conversation_token)

        if (existing) {
            return existing
        }

        // Si no existe, la creamos
        const { data: created, error } = await supabase
            .from('conversations')
            .insert({ conversation_token })
            .select()
            .single()

        if (error) throw error

        return created
    }

    static async findById(id) {
        const { data, error } = await supabase
            .from('conversations')
            .select('id, started_at')
            .eq('id', id)
            .maybeSingle()

        if (error) throw error

        return data
    }

    static async getAll() {
        // Obtenemos todas las conversaciones con sus mensajes incluidos
        const { data, error } = await supabase
            .from('conversations')
            .select('id, conversation_token, started_at, messages(id, content, sender_type, created_at)')
            .order('started_at', { ascending: false })

        if (error) throw error

        // Calculamos el número de mensajes y el primer mensaje del usuario
        return data.map(row => ({
            id: row.id,
            conversation_token: row.conversation_token,
            started_at: row.started_at,
            message_count: row.messages.length,
            first_message: row.messages
                .toSorted((a, b) => new Date(a.created_at) - new Date(b.created_at))
                .find(m => m.sender_type === 'user')?.content ?? null
        }))
    }

    /**
     * Borra una conversación y devuelve la fila borrada, o null si no existía.
     * Sus mensajes se borran por el ON DELETE CASCADE.
     *
     * @param {string} conversation_token - UUID público de la conversación
     * @returns {Promise<Object|null>} La conversación borrada, o null si no existía
     */
    static async deleteByToken(conversation_token) {
        const { data, error } = await supabase
            .from('conversations')
            .delete()
            .eq('conversation_token', conversation_token)
            .select()
            .maybeSingle()

        if (error) throw error

        return data
    }

    /**
     * Borra una conversación por su id interno y devuelve la fila borrada,
     * o null si no existía. Sus mensajes se borran por el ON DELETE CASCADE.
     *
     * @param {number} id - id interno de la conversación
     * @returns {Promise<Object|null>} La conversación borrada, o null si no existía
     */
    static async deleteById(id) {
        const { data, error } = await supabase
            .from('conversations')
            .delete()
            .eq('id', id)
            .select()
            .maybeSingle()

        if (error) throw error

        return data
    }

}

export default Conversation
