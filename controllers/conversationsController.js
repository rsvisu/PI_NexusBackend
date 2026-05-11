import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import AppError from '../errors/AppError.js'

class ConversationsController {

  static async getAll(req, res) {
    const conversations = await Conversation.getAll()

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
    const messages = await Message.getHistory(id)

    // ## Return
    return res.json({ messages })
  }

}

export default ConversationsController
