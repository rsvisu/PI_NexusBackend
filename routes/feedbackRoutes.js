import express from 'express';
import FeedbackController from '../controllers/feedbackController.js';

// ## Router:
const feedbackRouter = express.Router()

// ## Rutas:
feedbackRouter.get('/', FeedbackController.list)
feedbackRouter.patch('/:id/reviewed', FeedbackController.markReviewed)

// ## Exportación:
export default feedbackRouter