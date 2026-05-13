import express from 'express';
import ChatController from '../controllers/chatController.js';

// ## Router:
const chatRouter = express.Router()

// ## Rutas:
// Chat
chatRouter.post('/', ChatController.handleChatRequest)

// Historial
chatRouter.get('/history/:conversation_token', ChatController.getChatHistory)
chatRouter.delete('/history/:conversation_token', ChatController.deleteChatHistory)

// ## Exportación:
export default chatRouter