import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import consola from 'consola';
import chatRoutes from './routes/chatRoutes.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares:
app.use(cors());
app.use(express.json());
app.use(morgan('dev', { stream: { write: (msg) => consola.log(msg.trim()) } }));

// Rutas:
// Chat
app.use('/api/chat', chatRoutes);

// Prueba
app.get('/api/status', (req, res) => {
    res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

// Errores:
app.use(errorHandler);

// Levantamos el servidor:
app.listen(PORT, () => {
    consola.success(`Servidor inicializado en el puerto ${PORT}`);
});