import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares:
app.use(cors());
app.use(express.json());

// Rutas:
// Chat
app.use('/api/chat', chatRoutes);

// Prueba
app.get('/api/status', (req, res) => {
    res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

// Levantamos el servidor:
app.listen(PORT, () => {
    console.log(`Servidor inicializado en el puerto ${PORT}`);
});