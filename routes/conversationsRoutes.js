import express from 'express';
import ConversationsController from '../controllers/conversationsController.js';

// ## Router:
const conversationsRouter = express.Router()

// ## Rutas:
conversationsRouter.get('/', ConversationsController.getAll)
conversationsRouter.get('/:id', ConversationsController.getOne)
conversationsRouter.delete('/:id', ConversationsController.delete)

// ## Exportación:
export default conversationsRouter
