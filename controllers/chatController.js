import LlmService from '../services/llmService.js'
import RagService from '../services/ragService.js'
import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import Feedback from '../models/Feedback.js'
import AppError from '../errors/AppError.js'
import config from '../config/app.js'

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

    // En la primera interacción persistimos el saludo como primer mensaje
    // para que la conversación quede completa al inspeccionarla en el dashboard
    if (history.length === 0) {
      await Message.save(conversation.id, 'assistant', config.widget.greeting)
    }

    // Guardamos el mensaje del usuario
    await Message.save(conversation.id, 'user', message)

    // Generamos la respuesta con el contexto inyectado en el prompt
    const context = await RagService.retrieveContext(message)
    // TODO: si la generacion falla guardar en la base de datos que hubo un error en la respuesta para poder mostrarlo al usuario y al recargar y en el dashboard, y no perder el contexto de la conversación
    const aiResponse = await LlmService.generateResponse(message, history, context)

    // Guardamos la respuesta junto con las fuentes usadas
    const savedMessage = await Message.save(conversation.id, 'assistant', aiResponse, context)

    // ## Return
    // Devolvemos el id del mensaje para que el widget pueda votarlo después
    return res.json({
      id: savedMessage.id,
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
    const deleted = await Conversation.deleteByToken(conversation_token)

    // Si deleted es null, significa que no existía la conversación
    if (!deleted) {
      throw new AppError("Conversación no encontrada", 404)
    }

    // ## Return
    return res.status(204).send()

  }

  static async submitFeedback(req, res) {
    // ## Variables:
    const { message_id, vote, conversation_token } = req.body

    // ## Validaciones:
    if (!conversation_token || !uuidValidateV4(conversation_token)) {
      throw new AppError("Se requiere un 'conversation_token' valido", 400)
    }

    const id = Number.parseInt(message_id)
    if (Number.isNaN(id) || id <= 0) {
      throw new AppError("Se requiere un 'message_id' valido", 400)
    }

    if (vote !== 'positive' && vote !== 'negative') {
      throw new AppError("El 'vote' debe ser 'positive' o 'negative'", 400)
    }

    // ## Lógica:
    // Verificamos que el mensaje pertenece a la conversación del usuario
    // para que nadie pueda votar mensajes de conversaciones ajenas
    const conversation = await Conversation.find(conversation_token)
    if (!conversation) {
      throw new AppError("Conversación no encontrada", 404)
    }

    const message = await Message.findById(id)
    if (!message || message.conversation_id !== conversation.id) {
      throw new AppError("Mensaje no encontrado", 404)
    }

    // Solo se votan las respuestas del asistente, no los mensajes del usuario
    if (message.sender_type !== 'assistant') {
      throw new AppError("Solo se pueden votar las respuestas del asistente", 400)
    }

    const feedback = await Feedback.create({ message_id: id, vote })

    // ## Return
    return res.status(201).json({ feedback })
  }

}

export default ChatController
