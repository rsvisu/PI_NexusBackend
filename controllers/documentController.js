import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { TextLoader } from '@langchain/classic/document_loaders/fs/text';

import Document from '../models/Document.js'
import RagService from '../services/ragService.js'
import AppError from '../errors/AppError.js'

class DocumentController {

  static async list(req, res) {
    // ## Variables:
    const documents = await Document.getAll()

    // ## Return:
    return res.json({ documents })
  }

  static async upload(req, res) {
    // ## Variables:
    const file = req.file

    // ## Validaciones:
    if (!file) {
      throw new AppError("No se ha enviado ningún archivo", 400)
    }

    // ## Lógica:
    // Creamos un Blob a partir del buffer en memoria
    const fileBlob = new Blob([file.buffer], { type: file.mimetype })

    // Elegimos el loader según el tipo de archivo y le pasamos el Blob directamente
    let loader

    if (file.mimetype === 'application/pdf') {
      loader = new PDFLoader(fileBlob)
    }
    else if (file.mimetype.startsWith('text/')) {
      loader = new TextLoader(fileBlob)
    }
    else {
      throw new AppError(`No hay un loader configurado para el tipo: ${file.mimetype}`, 500)
    }

    // Cargamos el documento con el loader
    const rawDocs = await loader.load()

    // Registramos el documento antes de indexar
    const document = await Document.create({
      name: file.originalname,
      sourceType: 'file',
      sourceUri: file.originalname,
    })

    // Si la indexación falla, borramos el registro (rollback manual)
    // Los chunks no se insertaron, así que no queda estado parcial
    try {
      await RagService.indexDocument(rawDocs, document.id)
    } catch (error) {
      await Document.delete(document.id)
      throw error
    }

    // ## Return:
    return res.status(201).json({ document })
  }

  static async toggleActive(req, res) {
    // ## Variables:
    const id = Number.parseInt(req.params.id)
    const isActive = req.body.is_active

    // ## Validaciones:
    if (Number.isNaN(id) || id <= 0) {
      throw new AppError("Se requiere un 'id' válido", 400)
    }

    if (typeof isActive !== 'boolean') {
      throw new AppError("Se requiere 'is_active' (true o false)", 400)
    }

    // ## Lógica:
    const document = await Document.setActive(id, isActive)
    if (!document) {
      throw new AppError("Documento no encontrado", 404)
    }

    // ## Return:
    return res.json({ document })
  }

  static async remove(req, res) {
    // ## Variables:
    const id = Number.parseInt(req.params.id)

    // ## Validaciones:
    if (Number.isNaN(id) || id <= 0) {
      throw new AppError("Se requiere un 'id' válido", 400)
    }

    // ## Lógica:
    // Borrando el documento elimina sus chunks automáticamente por el ON DELETE CASCADE
    const deleted = await Document.delete(id)
    if (!deleted) {
      throw new AppError("Documento no encontrado", 404)
    }

    // ## Return:
    return res.status(204).send()
  }

}

export default DocumentController