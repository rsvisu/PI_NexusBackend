import Folder from '../models/Folder.js'
import AppError from '../errors/AppError.js'

class FolderController {

  static async list(req, res) {
    // ## Variables:
    const folders = await Folder.getAll()

    // ## Return:
    return res.json({ folders })
  }

  static async create(req, res) {
    // ## Variables:
    const rawName = req.body.name

    // ## Validaciones:
    if (typeof rawName !== 'string') {
      throw new AppError("Se requiere un 'name' válido", 400)
    }
    const name = rawName.trim()
    if (name === '') {
      throw new AppError("El nombre no puede estar vacío", 400)
    }

    // ## Lógica:

    try {
      const folder = await Folder.create({ name })
      return res.status(201).json({ folder })
    } catch (error) {
      // El UNIQUE de folders.name provoca un error 23505 de Postgres si el nombre
      // ya existe. Lo capturamos y traducimos a HTTP 409 (conflicto de recurso).
      if (error.code === '23505') {
        throw new AppError("Ya existe una carpeta con ese nombre", 409)
      }
      throw error
    }
  }

  static async update(req, res) {
    // ## Variables:
    const id = Number.parseInt(req.params.id)
    const rawName = req.body.name

    // ## Validaciones:
    if (Number.isNaN(id) || id <= 0) {
      throw new AppError("Se requiere un 'id' válido", 400)
    }
    if (typeof rawName !== 'string') {
      throw new AppError("Se requiere un 'name' válido", 400)
    }
    const name = rawName.trim()
    if (name === '') {
      throw new AppError("El nombre no puede estar vacío", 400)
    }

    // ## Lógica:
    let folder
    try {
      folder = await Folder.update(id, { name })
    } catch (error) {
      if (error.code === '23505') {
        throw new AppError("Ya existe una carpeta con ese nombre", 409)
      }
      throw error
    }
    if (!folder) {
      throw new AppError("Carpeta no encontrada", 404)
    }

    // ## Return:
    return res.json({ folder })
  }

  static async remove(req, res) {
    // ## Variables:
    const id = Number.parseInt(req.params.id)

    // ## Validaciones:
    if (Number.isNaN(id) || id <= 0) {
      throw new AppError("Se requiere un 'id' válido", 400)
    }

    // ## Lógica:
    const deleted = await Folder.delete(id)
    if (!deleted) {
      throw new AppError("Carpeta no encontrada", 404)
    }

    // ## Return:
    return res.status(204).send()
  }

}

export default FolderController