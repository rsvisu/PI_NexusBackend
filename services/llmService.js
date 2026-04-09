import { SystemMessage, HumanMessage, AIMessage } from "langchain";
import { ChatOpenAI } from "@langchain/openai";

const chatModel = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.2,
});

const SYSTEM_PROMPT =
  `Eres el asistente virtual oficial del CPIFP Los Enlaces (Zaragoza). Tu objetivo es resolver dudas de alumnos y familias de forma profesional, amable y eficiente.

INFORMACIÓN DEL CENTRO:
- Dirección: C/ Jarque de Moncayo nº 10, 50012, Zaragoza.
- Teléfono: 976 300 804.
- Fax: 976 314 403.
- Web oficial: https://cpilosenlaces.com/

HORARIO DE SECRETARÍA:
- General (1 sept - 30 julio): Lunes a viernes de 9:00h a 14:00h.
- Tardes (1 sept - 30 junio): Martes de 17:00h a 19:00h.

OFERTA FORMATIVA:
- Se imparte ciclos de FP Básica, Grado Medio y Grado Superior en las familias de Informática y Comunicaciones, e Imagen y Sonido.
- Enlace a ciclos: https://cpilosenlaces.com/oferta-formativa/ciclos/

REGLAS DE COMPORTAMIENTO:
1. Si no conoces un dato específico sobre matriculación o plazos actuales, no lo inventes. Deriva al usuario a la página de contacto (https://cpilosenlaces.com/centro/contacto/) o indica que llame por teléfono en el horario de secretaría.
2. Mantén un tono institucional pero cercano.
3. Responde de forma concisa. Usa listas con viñetas para datos múltiples.
4. Identifícate como "Nexus", el asistente del centro.
`;

/**
 * Función para obtener una respuesta del LLM.
 */
export async function generateResponse(userMessage, history = []) {
  try {

    // Iniciamos el array con el System Prompt
    const messages = [new SystemMessage(SYSTEM_PROMPT)];

    // Recorremos el historial que nos manda el frontend y lo añadimos
    // Asumimos que el frontend envía objetos tipo { role: 'user' | 'assistant', content: 'texto' }
    for (const msg of history) {
      if (msg.role === "user") {
        messages.push(new HumanMessage(msg.content));
      } else if (msg.role === "assistant") {
        messages.push(new AIMessage(msg.content));
      }
    }

    // Añadimos la pregunta actual del usuario al final
    messages.push(new HumanMessage(userMessage));

    // Invocamos al modelo con t0do el array de mensajes
    const response = await chatModel.invoke(messages);

    return response.content;
  } catch (error) {
    console.error("Error en llmService:", error);
    throw new Error("Error al comunicarse con la IA");
  }
}
