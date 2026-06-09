import supabase from '../database/supabaseClient.js';

class Message {

    static async findById(id) {
        const { data, error } = await supabase
            .from('messages')
            .select('id, conversation_id, sender_type')
            .eq('id', id)
            // maybeSingle() devuelve null si no encuentra nada
            .maybeSingle();

        if (error) throw error
        return data;
    }

    static async getHistory(conversation_id) {
        // Cargamos todos los mensajes de la conversación ordenados por fecha
        const { data } = await supabase
            .from('messages')
            .select('id, sender_type, content, created_at')
            .eq('conversation_id', conversation_id)
            .order('created_at', { ascending: true });

        return data || [];
    }

    static async save(conversation_id, sender_type, content, sources = null) {
        // Guardamos un mensaje en la base de datos
        const { data, error } = await supabase
            .from('messages')
            .insert({
                conversation_id,
                sender_type,
                content,
                sources,
            })
            .select()
            .single();

        if (error) throw error
        return data;
    }
}

export default Message;