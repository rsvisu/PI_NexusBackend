import multer from 'multer';
import config from '../config/app.js';
import AppError from '../errors/AppError.js';

// Almacenamiento en memoria: el archivo va a req.file.buffer como un Buffer de Node.js
const uploadMiddleware = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: config.upload.maxSizeMb * 1024 * 1024 // MB a bytes
    },
    fileFilter: (req, file, cb) => {
        // Solo dejamos pasar los mimetypes permitidos
        if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new AppError(`Tipo de archivo no permitido. Permitidos: ${config.upload.allowedMimeTypes.join(', ')}`, 400), false);
        }
    }
});

export default uploadMiddleware;