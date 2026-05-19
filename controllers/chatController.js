import LlmService from '../services/llmService.js'
import RagService from '../services/ragService.js'
import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import AppError from '../errors/AppError.js'

import { uuidValidateV4 } from '../utils/uuid.js'

class ChatController {
  static async handleChatRequest(req, res) {
    // ## Variables:
    const { message, conversation_token } = req.body

    // ## Validaciones: ; TODO: considerar usar zod para esto
    if (!message || message.trim() === '') {
      throw new AppError("El mensaje no puede estar vacío", 400)
    }

    if (!conversation_token || !uuidValidateV4(conversation_token)) {
      throw new AppError("Se requiere un 'conversation_token' valido ", 400)
    }

    // ## Lógica:
    // Buscamos o creamos la conversación con ese token y cargamos el historial desde la base de datos
    const conversation = await Conversation.findOrCreate(conversation_token)
    const history = await Message.getHistory(conversation.id)

    // Guardamos el mensaje del usuario
    await Message.save(conversation.id, 'user', message)

    // Generamos la respuesta con el contexto inyectado en el prompt
    const context = await RagService.retrieveContext(message)
    // TODO: si la generacion falla guardar en la base de datos que hubo un error en la respuesta para poder mostrarlo al usuario y al recargar y en el dashboard, y no perder el contexto de la conversación
    const aiResponse = await LlmService.generateResponse(message, history, context)

    // Guardamos la respuesta junto con las fuentes usadas
    await Message.save(conversation.id, 'assistant', aiResponse, context)

    // ## Return
    return res.json({
      content: aiResponse,
      sender_type: "assistant"
    })
  }

  static async getChatHistory(req, res) {
    // ## Variables:
    const { conversation_token } = req.params

    // ## Validaciones: ; TODO: considerar usar zod para esto
    if (!conversation_token) {
      throw new AppError("El 'conversation_token' no se ha proporcionado", 400)
    }

    if (!uuidValidateV4(conversation_token)) {
      throw new AppError("Se requiere un 'conversation_token' valido ", 400)
    }

    // ## Lógica:
    // Buscamos la conversación con ese token
    const conversation = await Conversation.find(conversation_token)

    if (!conversation) {
      throw new AppError("Conversación no encontrada", 404)
    }

    // Cargamos el historial desde la base de datos
    const history = await Message.getHistory(conversation.id)

    // ## Return
    return res.json({
      messages: history
    })

  }

  static async deleteChatHistory(req, res) {
    // ## Variables:
    const { conversation_token } = req.params

    // ## Validaciones: ; TODO: considerar usar zod para esto
    if (!conversation_token) {
      throw new AppError("El 'conversation_token' no se ha proporcionado", 400)
    }

    if (!uuidValidateV4(conversation_token)) {
      throw new AppError("Se requiere un 'conversation_token' valido ", 400)
    }

    // ## Lógica:
    const deleted = await Conversation.delete(conversation_token)

    // Si deleted es null, significa que no existía la conversación
    if (!deleted) {
      throw new AppError("Conversación no encontrada", 404)
    }

    // ## Return
    return res.status(204).send()

  }

}

export default ChatController
