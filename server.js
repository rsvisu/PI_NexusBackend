import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import consola from 'consola';
import config from './config/app.js';
import createChatRouter from './routes/chatRoutes.js';
import createConversationsRouter from './routes/conversationsRoutes.js';
import errorHandler from './middlewares/errorHandler.js';
import createChatRateLimiter from './middlewares/rateLimiter.js';

const app = express();

// # Middlewares:
// ## Cors
app.use(cors({
  origin: config.app.allowedOrigins ?? '*',
  methods: ['GET', 'POST', 'DELETE'],
}));

// ## Json
app.use(express.json());

// ## Logger
app.use(morgan('dev', { stream: { write: (msg) => consola.log(msg.trim()) } }));

// # Rutas:

// ## Chat
app.use('/api/chat', createChatRateLimiter(), createChatRouter());
// ## Conversaciones
app.use('/api/conversations', createConversationsRouter());

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