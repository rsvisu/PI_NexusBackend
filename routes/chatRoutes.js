import express from 'express';
import ChatController from '../controllers/chatController.js';

// /api/chat

const router = express.Router();

router.post('/', ChatController.handleChatRequest);

export default router;