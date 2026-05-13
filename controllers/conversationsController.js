import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import AppError from '../errors/AppError.js'

class ConversationsController {

  static async getAll(req, res) {
    // ## Variables:
    const conversations = await Conversation.getAll()

    // ## Return:
    return res.json({ conversations })
  }

  static async getOne(req, res) {
    // ## Variables:
    const id = Number.parseInt(req.params.id)

    // ## Validaciones:
    if (Number.isNaN(id) || id <= 0) {
      throw new AppError("Se requiere un 'id' válido", 400)
    }

    // ## Lógica:
    const conversation = await Conversation.findById(id)
    if (!conversation) {
      throw new AppError("Conversación no encontrada", 404)
    }
    const messages = await Message.getHistory(id)

    // ## Return:
    return res.json({ conversation, messages })
  }

}

export default ConversationsController
