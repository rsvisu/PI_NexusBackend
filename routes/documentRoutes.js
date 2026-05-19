import express from 'express';
import DocumentController from '../controllers/documentController.js';
import uploadMiddleware from '../middlewares/uploadMiddleware.js';

// ## Router:
const documentRouter = express.Router()

// ## Rutas:
documentRouter.get('/', DocumentController.list)
documentRouter.post('/file', uploadMiddleware.single('file'), DocumentController.upload)
documentRouter.patch('/:id/active', DocumentController.toggleActive)
documentRouter.delete('/:id', DocumentController.remove)

// ## Exportación:
export default documentRouter
