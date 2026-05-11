import express from 'express';
import ChatController from '../controllers/chatController.js';

export default function createChatRouter() {
    const router = express.Router()

    router.post('/', ChatController.handleChatRequest)
    router.get('/history/:conversation_token', ChatController.getChatHistory)

    return router
}