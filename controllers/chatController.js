import LlmService from '../services/providers/openai/llmService.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import AppError from '../errors/AppError.js';

class ChatController {
  static async handleChatRequest(req, res) {
    const { message, conversation_token } = req.body;

    if (!message || message.trim() === '') {
      throw new AppError("El mensaje no puede estar vacío", 400);
    }

    if (!conversation_token) {
      throw new AppError("Se requiere conversation_token", 400);
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
  }
}

export default ChatController;
