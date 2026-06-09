import Feedback from '../models/Feedback.js'
import AppError from '../errors/AppError.js'

class FeedbackController {

  static async list(req, res) {
    // ## Variables:
    const feedback = await Feedback.getAll()

    // ## Return:
    return res.json({ feedback })
  }

  static async markReviewed(req, res) {
    // ## Variables:
    const id = Number.parseInt(req.params.id)

    // ## Validaciones:
    if (Number.isNaN(id) || id <= 0) {
      throw new AppError("Se requiere un 'id' válido", 400)
    }

    // ## Lógica:
    const feedback = await Feedback.markReviewed(id)
    if (!feedback) {
      throw new AppError("Feedback no encontrado", 404)
    }

    // ## Return:
    return res.json({ feedback })
  }

}

export default FeedbackController