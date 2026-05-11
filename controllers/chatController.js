import LlmService from '../services/providers/openai/llmService.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

class ChatController {
  static async handleChatRequest(req, res) {
    try {
      const { message, conversation_token } = req.body;

      if (!message || message.trim() === '') {
        return res.status(400).json({ error: "El mensaje no puede estar vacío" });
      }

      if (!conversation_token) {
        return res.status(400).json({ error: "Se requiere conversation_token" });
      }

      // Buscamos o creamos la conversación con ese token
      const conversation = await Conversation.findOrCreate(conversation_token);

      // Cargamos el historial desde la base de datos
      const history = await Message.getHistory(conversation.id);

      // Guardamos el mensaje del usuario
      await Message.save(conversation.id, 'user', message);

      // Generamos la respuesta
      const aiResponse = await LlmService.generateResponse(message, history);

      // Guardamos la respuesta del asistente
      await Message.save(conversation.id, 'assistant', aiResponse);

      return res.json({
        reply: aiResponse,
        sender: "assistant"
      });

    } catch (error) {
      console.error("Error en ChatController:", error);
      return res.status(500).json({
        reply: "Lo siento, tengo problemas de conexión ahora mismo. Por favor, inténtalo más tarde."
      });
    }
  }
}

export default ChatController;