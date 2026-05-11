import supabase from '../database/supabaseClient.js';

class Conversation {

    static async findOrCreate(conversationToken) {
        // Buscamos si ya existe una conversación con ese token
        const { data: existing } = await supabase
            .from('conversations')
            .select('*')
            .eq('conversation_token', conversationToken)
            .single();

        if (existing) return existing;

        // Si no existe, la creamos
        const { data: created } = await supabase
            .from('conversations')
            .insert({ conversation_token: conversationToken })
            .select()
            .single();

        return created;
    }
}

export default Conversation;