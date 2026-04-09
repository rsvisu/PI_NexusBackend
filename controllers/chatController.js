import { generateResponse } from '../services/llmService.js';

export async function handleChatRequest(req, res) {
  try {
    // Extraemos el mensaje actual y el array de historial (si no viene, por defecto es un array vacío)
    const { message, history = [] } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: "El mensaje no puede estar vacío." });
    }

    // Pasamos el mensaje y el historial
    const aiResponse = await generateResponse(message, history);

    return res.json({
      reply: aiResponse,
      sender: "assistant"
    });

  } catch (error) {
    console.error("Error en chatController:", error);
    return res.status(500).json({
      reply: "Lo siento, tengo problemas de conexión ahora mismo. Por favor, inténtalo más tarde."
    });
  }
};