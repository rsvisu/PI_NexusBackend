// # Importaciones:
// ## Dependecias
import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import consola from 'consola';
// ## Configuración
import config from './config/app.js';
// ## Rutas
import chatRouter from './routes/chatRoutes.js';
import conversationsRouter from './routes/conversationsRoutes.js';
import documentRouter from './routes/documentRoutes.js';
import folderRouter from './routes/folderRoutes.js';
import feedbackRouter from './routes/feedbackRoutes.js';
import configRouter from './routes/configRoutes.js';
// ## Middlewares
import errorHandler from './middlewares/errorHandler.js';
import authMiddleware from './middlewares/authMiddleware.js';
// ## Configuración dinámica desde BD
import SystemConfig from './models/SystemConfig.js';

// # Inicialización de la aplicación:
const app = express();

// # Middlewares:
// ## Cors
app.use(cors({
  origin: config.app.allowedOrigins ?? '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));

// ## JSON
app.use(express.json());

// ## Logger
app.use(morgan('dev', { stream: { write: (msg) => consola.log(msg.trim()) } }));

// # Rutas:

// ## Públicas:
// ### Chat
app.use('/api/chat', chatRouter);
// ## Estatus
app.get('/api/status', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

// ## Privadas (Dashboard):
// ### Conversaciones
app.use('/api/conversation', authMiddleware, conversationsRouter);
// ### Documentos
app.use('/api/document', authMiddleware, documentRouter);
// ### Carpetas
app.use('/api/folder', authMiddleware, folderRouter);
// ### Feedback
app.use('/api/feedback', authMiddleware, feedbackRouter);
// ### Configuración
app.use('/api/config', authMiddleware, configRouter);


// # Errores:
app.use(errorHandler);

// # Funciones de arranque:
// Carga la configuración guardada en BD y la aplica en memoria.
// Si falla (BD no disponible, tabla no creada aún), arrancamos con los valores del .env
async function initConfig() {
  try {
    // Cargamos la configuración
    const savedConfig = await SystemConfig.get()

    // La aplicamos
    config.chat.rateLimitMax = savedConfig.rate_limit_max

    config.llm.openAI.apiKey = savedConfig.openai_api_key
    // Sobrescribimos la clave si existe en el .env
    if (process.env.OPENAI_API_KEY) {
      config.llm.openAI.apiKey = process.env.OPENAI_API_KEY
    }

    consola.info('Configuración cargada desde la base de datos')
  } catch {
    consola.warn('No se pudo cargar la configuración desde BD, usando valores por defecto del .env')
  }
}

// # Iniciar servidor:
app.listen(config.app.port, async () => {
  consola.success(`Servidor inicializado en el puerto ${config.app.port}`);
  await initConfig();
});