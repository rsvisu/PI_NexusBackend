import { randomUUID } from 'crypto';
import sanitizeFilename from 'sanitize-filename';
import consola from 'consola';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { TextLoader } from '@langchain/classic/document_loaders/fs/text';

import Document from '../models/Document.js'
import RagService from '../services/ragService.js'
import StorageService from '../services/storageService.js'
import config from '../config/app.js'
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

    // Saneamos el nombre original
    const safeName = sanitizeFilename(file.originalname)

    // Prefijo UUID para evitar colisiones
    // El nombre legible esta en documents.name, este path es solo identificador único dentro del bucket
    const storagePath = `${randomUUID()}-${safeName}`

    // ### Flujo de subida con rollback manual:
    let storageUploaded = false
    let document = null

    try {
      // Subimos el archivo a Storage
      await StorageService.upload(storagePath, file.buffer, file.mimetype)
      storageUploaded = true

      // Creamos el registro en la BD y obtenemos su ID para relacionar los chunks
      document = await Document.create({
        name: file.originalname,
        sourceType: 'file',
        sourceUri: storagePath,
      })

      // Indexamos el documento en RAG, relacionando los chunks con el ID del documento creado
      await RagService.indexDocument(rawDocs, document.id)
    }

    // Rollback: borramos solo lo que se llegó a crear, en orden inverso.
    catch (error) {
      // Si el documento se creó en la BD pero falló algo después, lo borramos para no dejarlo huérfano
      if (document) {
        try {
          await Document.delete(document.id)
        } catch (cleanupError) {
          consola.warn(`Rollback fallido en documentController: no se pudo borrar documents.id=${document.id}`, cleanupError)
        }
      }

      // Si el archivo se subió a Storage pero falló algo después, lo borramos para no dejarlo huérfano
      if (storageUploaded) {
        try {
          await StorageService.remove(storagePath)
        } catch (cleanupError) {
          consola.warn(`Rollback fallido en documentController: archivo huérfano en Storage: ${storagePath}`, cleanupError)
        }
      }

      // Finalmente, lanzamos el error original para que se maneje en el middleware de errores
      throw error
    }

    // ## Return:
    return res.status(201).json({ document })
  }

  static async getDownloadUrl(req, res) {
    // ## Variables:
    const id = Number.parseInt(req.params.id)

    // ## Validaciones:
    if (Number.isNaN(id) || id <= 0) {
      throw new AppError("Se requiere un 'id' válido", 400)
    }

    // ## Lógica:
    const document = await Document.findById(id)
    if (!document) {
      throw new AppError("Documento no encontrado", 404)
    }

    // Generamos una URL firmada temporal
    const url = await StorageService.getSignedUrl(
      document.source_uri,
      config.storage.signedUrlExpirySeconds
    )

    // ## Return:
    return res.json({ url, expiresIn: config.storage.signedUrlExpirySeconds })
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
    // Borrando el documento de la BD se eliminan sus chunks por ON DELETE CASCADE
    const deleted = await Document.delete(id)
    if (!deleted) {
      throw new AppError("Documento no encontrado", 404)
    }

    // Si falla el borrado en Storage el archivo queda huérfano, pero la fila de BD ya está eliminada
    try {
      await StorageService.remove(deleted.source_uri)
    } catch (error) {
      consola.warn(`Archivo huérfano en Storage: ${deleted.source_uri}`, error)
    }

    // ## Return:
    return res.status(204).send()
  }

}

export default DocumentController