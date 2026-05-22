import { randomUUID } from 'crypto';
import slugify from 'slugify';
import consola from 'consola';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { TextLoader } from '@langchain/classic/document_loaders/fs/text';

import Document from '../models/Document.js'
import Folder from '../models/Folder.js'
import RagService from '../services/ragService.js'
import StorageService from '../services/storageService.js'
import config from '../config/app.js'
import AppError from '../errors/AppError.js'
import DocumentSchemas from '../schemas/documentSchemas.js'

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
    const { folder_id, expires_at } = DocumentSchemas.validateDocumentUpload(req.body)

    // ## Validaciones:
    // ### Archivo:
    if (!file) {
      throw new AppError("No se ha enviado ningún archivo", 400)
    }

    // ### Carpeta:
    // Comprobamos si existe la carpeta indicada (si se ha indicado)
    if (folder_id) {
      const folder = await Folder.findById(folder_id)
      if (!folder) {
        throw new AppError("La carpeta indicada no existe", 404)
      }
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
    const safeName = slugify(file.originalname, { lower: true, locale: 'es', strict: false })

    // Prefijo UUID para evitar colisiones
    // El nombre legible esta en documents.name, este path es solo identificador único dentro del bucket
    const storagePath = `${randomUUID()}_${safeName}`

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
        source_type: 'file',
        source_uri: storagePath,
        folder_id: folder_id ?? null,
        expires_at: expires_at ?? null,
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
    const { id } = DocumentSchemas.validateId(req.params)

    // ## Lógica:
    const document = await Document.findById(id)
    if (!document) {
      throw new AppError("Documento no encontrado", 404)
    }

    // Generamos una URL firmada temporal con cabecera de descarga forzada
    const url = await StorageService.getSignedUrl(
      document.source_uri,
      config.storage.signedUrlExpirySeconds,
      document.name
    )

    // ## Return:
    return res.json({ url, expiresIn: config.storage.signedUrlExpirySeconds })
  }

  static async update(req, res) {
    // ## Variables:
    const { id } = DocumentSchemas.validateId(req.params)
    const validated = DocumentSchemas.validateDocumentUpdate(req.body)
    const { name, folder_id, expires_at } = validated

    // ## Validaciones:
    // ### Campos:
    // Al menos un campo debe venir para actualizar
    if (Object.keys(validated).length === 0) {
      throw new AppError("Se requiere al menos un campo para actualizar", 400)
    }

    // ### Carpeta:
    // Si se quiere mover el documento a una carpeta, esa carpeta debe existir
    if (folder_id) {
      const folder = await Folder.findById(folder_id)
      if (!folder) {
        throw new AppError("La carpeta indicada no existe", 404)
      }
    }

    // ## Lógica:
    const document = await Document.update(id, {
      name,
      folder_id,
      expires_at,
    })
    if (!document) {
      throw new AppError("Documento no encontrado", 404)
    }

    // ## Return:
    return res.json({ document })
  }

  static async toggleActive(req, res) {
    // ## Variables:
    const { id } = DocumentSchemas.validateId(req.params)
    const { is_active } = DocumentSchemas.validateDocumentToggleActive(req.body)

    // ## Lógica:
    const document = await Document.setActive(id, is_active)
    if (!document) {
      throw new AppError("Documento no encontrado", 404)
    }

    // ## Return:
    return res.json({ document })
  }

  static async remove(req, res) {
    // ## Variables:
    const { id } = DocumentSchemas.validateId(req.params)

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