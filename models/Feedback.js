import supabase from '../database/supabaseClient.js';

class Feedback {

    /**
     * Registra el voto de un mensaje. Hacemos upsert sobre message_id porque
     * el schema tiene UNIQUE(message_id): un mensaje tiene un único voto, y si
     * el usuario vuelve a votar simplemente se actualiza el existente.
     *
     * @param {Object} options
     * @param {number} options.message_id - id del mensaje del asistente votado
     * @param {string} options.vote - 'positive' o 'negative'
     * @returns {Promise<Object>} La fila de feedback insertada o actualizada
     */
    static async create({ message_id, vote }) {
        const { data, error } = await supabase
            .from('feedback')
            .upsert({ message_id, vote }, { onConflict: 'message_id' })
            .select()
            .single()

        if (error) throw error

        return data
    }

    /**
     * Lista todo el feedback para el dashboard, con el contenido del mensaje
     * votado y el id de su conversación para poder enlazar al contexto.
     * El filtrado por voto (positivo/negativo) y por estado lo aplica la vista.
     *
     * @returns {Promise<Array>} Filas de feedback, más recientes primero
     */
    static async getAll() {
        const { data, error } = await supabase
            .from('feedback')
            .select('id, vote, is_reviewed, created_at, messages(id, content, conversation_id)')
            .order('created_at', { ascending: false })

        if (error) throw error

        // Aplanamos el mensaje anidado para que la vista no tenga que navegar la relación
        return data.map(row => ({
            id: row.id,
            vote: row.vote,
            is_reviewed: row.is_reviewed,
            created_at: row.created_at,
            message_id: row.messages.id,
            message_content: row.messages.content,
            conversation_id: row.messages.conversation_id,
        }))
    }

    /**
     * Marca un feedback como revisado.
     *
     * @param {number} id - id del feedback
     * @returns {Promise<Object|null>} El feedback actualizado, o null si no existía
     */
    static async markReviewed(id) {
        const { data, error } = await supabase
            .from('feedback')
            .update({ is_reviewed: true })
            .eq('id', id)
            .select()
            .maybeSingle()

        if (error) throw error

        return data
    }

}

export default Feedback