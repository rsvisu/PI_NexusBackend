import supabase from '../database/supabaseClient.js';

class Conversation {

    static async find(conversationToken) {
        // Buscamos si ya existe una conversación con ese token
        const { data } = await supabase
            .from('conversations')
            .select('*')
            .eq('conversation_token', conversationToken)
            .single()

        return data
    }

    static async findOrCreate(conversationToken) {
        // Buscamos si ya existe una conversación con ese token
        const existing = await this.find(conversationToken)

        if (existing) {
            return existing
        }

        // Si no existe, la creamos
        const { data: created } = await supabase
            .from('conversations')
            .insert({ conversation_token: conversationToken })
            .select()
            .single()

        return created
    }
}

export default Conversation
