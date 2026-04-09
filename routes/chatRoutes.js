import express from 'express';
import { handleChatRequest } from '../controllers/chatController.js';

// /api/chat

const router = express.Router();

router.post('/', handleChatRequest);

export default router;