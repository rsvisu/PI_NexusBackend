import express from 'express';
import FolderController from '../controllers/folderController.js';

// ## Router:
const folderRouter = express.Router()

// ## Rutas:
folderRouter.get('/', FolderController.list)
folderRouter.post('/', FolderController.create)
folderRouter.patch('/:id', FolderController.update)
folderRouter.delete('/:id', FolderController.remove)

// ## Exportación:
export default folderRouter
