import express from 'express';
import ConversationsController from '../controllers/conversationsController.js';

export default function createConversationsRouter() {
    const router = express.Router()

    router.get('/', ConversationsController.getAll)
    router.get('/:id', ConversationsController.getOne)

    return router
}
