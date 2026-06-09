import express from 'express';
import ChatController from '../controllers/chatController.js';
import { chatRateLimiter } from '../middlewares/rateLimiter.js';

// ## Router:
const chatRouter = express.Router()

// ## Rutas:
// Chat
chatRouter.post('/', chatRateLimiter, ChatController.handleChatRequest)

// Historial
chatRouter.get('/history/:conversation_token', ChatController.getChatHistory)
chatRouter.delete('/history/:conversation_token', ChatController.deleteChatHistory)

// Feedback de un mensaje
chatRouter.post('/feedback', ChatController.submitFeedback)

// ## Exportación:
export default chatRouter