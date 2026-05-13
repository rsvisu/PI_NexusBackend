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
// ## Middlewares
import errorHandler from './middlewares/errorHandler.js';
import { chatRateLimiter } from './middlewares/rateLimiter.js';

// # Inicialización de la aplicación:
const app = express();

// # Middlewares:
// ## Cors
app.use(cors({
  origin: config.app.allowedOrigins ?? '*',
  methods: ['GET', 'POST', 'DELETE'],
}));

// ## JSON
app.use(express.json());

// ## Logger
app.use(morgan('dev', { stream: { write: (msg) => consola.log(msg.trim()) } }));

// # Rutas:
// ## Chat
app.use('/api/chat', chatRateLimiter, chatRouter);
// ## Conversaciones
app.use('/api/conversations', conversationsRouter);
// ## Estatus
app.get('/api/status', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

// # Errores:
app.use(errorHandler);

// # Iniciar servidor:
app.listen(config.app.port, () => {
  consola.success(`Servidor inicializado en el puerto ${config.app.port}`);
});