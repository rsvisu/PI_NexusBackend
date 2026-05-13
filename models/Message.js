import supabase from '../database/supabaseClient.js';

class Message {

    static async getHistory(conversationId) {
        // Cargamos todos los mensajes de la conversación ordenados por fecha
        const { data } = await supabase
            .from('messages')
            .select('sender_type, content, created_at')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        return data || [];
    }

    static async save(conversationId, senderType, content, sources = null) {
        // Guardamos un mensaje en la base de datos
        const { data } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_type: senderType,
                content,
                sources,
            })
            .select()
            .single();

        return data;
    }
}

export default Message;