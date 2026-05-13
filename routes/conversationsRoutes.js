import express from 'express';
import ConversationsController from '../controllers/conversationsController.js';

// ## Router:
const conversationsRouter = express.Router()

// ## Rutas:
conversationsRouter.get('/', ConversationsController.getAll)
conversationsRouter.get('/:id', ConversationsController.getOne)

// ## Exportación:
export default conversationsRouter
