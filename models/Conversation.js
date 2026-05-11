import supabase from '../database/supabaseClient.js';

class Conversation {

    static async find(conversationToken) {
        const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('conversation_token', conversationToken)
            // maybeSingle() devuelve null si no encuentra nada
            .maybeSingle()

        if (error) throw error


        return data
    }

    static async findOrCreate(conversationToken) {
        // Buscamos si ya existe una conversación con ese token
        const existing = await this.find(conversationToken)

        if (existing) {
            return existing
        }

        // Si no existe, la creamos
        const { data: created, error } = await supabase
            .from('conversations')
            .insert({ conversation_token: conversationToken })
            .select()
            .single()

        if (error) throw error

        return created
    }

    static async delete(conversationToken) {
        // Borramos la conversación
        const { error } = await supabase
            .from('conversations')
            .delete()
            .eq('conversation_token', conversationToken)

        if (error) throw error
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

}

export default Conversation
