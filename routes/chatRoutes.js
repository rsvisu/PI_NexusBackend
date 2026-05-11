import express from 'express';
import ChatController from '../controllers/chatController.js';

export default function createChatRouter() {
    const router = express.Router()

    // Chat
    router.post('/', ChatController.handleChatRequest)

    // Historial
    router.get('/history/:conversation_token', ChatController.getChatHistory)
    router.delete('/history/:conversation_token', ChatController.deleteChatHistory)

    return router
}