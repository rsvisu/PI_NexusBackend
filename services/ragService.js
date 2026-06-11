import { OpenAIEmbeddings } from '@langchain/openai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import supabase from '../database/supabaseClient.js';
import config from '../config/app.js';

// # Configuración:

// ## Texts splitter:
const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
});

// ## Embedding y vector store:
// Se construyen bajo demanda para recoger la apiKey cargada desde BD al arrancar
let embeddingsApiKey = config.llm.openAI.apiKey;

let embeddings = new OpenAIEmbeddings({
    apiKey: embeddingsApiKey,
    modelName: config.llm.openAI.embeddingModel,
});

let vectorStore = new SupabaseVectorStore(embeddings, {
    client: supabase,
    tableName: 'document_chunks',
    queryName: 'match_document_chunks',
});

// Devuelve embeddings y vectorStore actualizados si la API key cambió en config
function getEmbeddingInstances() {
    if (config.llm.openAI.apiKey !== embeddingsApiKey) {
        embeddingsApiKey = config.llm.openAI.apiKey;
        embeddings = new OpenAIEmbeddings({
            apiKey: embeddingsApiKey,
            modelName: config.llm.openAI.embeddingModel,
        });
        vectorStore = new SupabaseVectorStore(embeddings, {
            client: supabase,
            tableName: 'document_chunks',
            queryName: 'match_document_chunks',
        });
    }
    return { embeddings, vectorStore };
}

// # Servicio:
class RagService {
    /**
     * Divide en chunks los Document que vienen del loader, genera embeddings
     * y los guarda en document_chunks
     *
     * El controlador solo decide qué loader usar según el tipo
     * @param {Array} rawDocs - Document[] cargados por el loader
     * @param {*} documentId - ID del documento al que pertenecen los chunks
     */
    static async indexDocument(rawDocs, documentId) {
        const { embeddings: currentEmbeddings } = getEmbeddingInstances();
        const docs = await splitter.splitDocuments(rawDocs);

        // INSERT manual en vez de vectorStore.addDocuments:
        // addDocuments solo escribe content, metadata, embedding en una tabla y no
        // admite document_id. Lo necesitamos para ligar cada chunk a su documento
        // fuente, y así borrarlos en cascada y filtrar por is_active en la búsqueda
        const texts = docs.map((doc) => doc.pageContent);
        const vectors = await currentEmbeddings.embedDocuments(texts);

        const rows = texts.map((content, i) => ({
            document_id: documentId,
            content,
            metadata: docs[i].metadata,
            embedding: vectors[i],
        }));

        const { error } = await supabase.from('document_chunks').insert(rows);
        if (error) throw error;
    }

    /**
     * Devuelve los chunks más similares a la query junto con su puntuación de similitud
     * @param {*} query - Texto de la consulta del usuario
     * @param {number} k - Número de chunks a devolver
     * @returns 
     */
    static async retrieveContext(query, k = 10) {
        // Solo incluimos chunks con similitud suficiente para no contaminar el prompt con contexto irrelevante
        const { vectorStore: currentVectorStore } = getEmbeddingInstances();
        const results = await currentVectorStore.similaritySearchWithScore(query, k);
        return results
            .filter(([, score]) => score >= config.llm.similarityThreshold)
            .map(([doc, score]) => ({
                content: doc.pageContent,
                metadata: doc.metadata,
                similarity: score,
            }));
    }
}

export default RagService;
