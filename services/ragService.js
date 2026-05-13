import { OpenAIEmbeddings } from '@langchain/openai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import supabase from '../database/supabaseClient.js';
import config from '../config/app.js';

const embeddings = new OpenAIEmbeddings({
    apiKey: config.llm.openAI.apiKey,
    modelName: 'text-embedding-3-small',
});

// vectorStore solo se usa para leer
const vectorStore = new SupabaseVectorStore(embeddings, {
    client: supabase,
    tableName: 'document_chunks',
    queryName: 'match_document_chunks',
});

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
});

class RagService {
    /**
     * Divide el texto en chunks, genera embeddings y los guarda en document_chunks
     * @param {*} text Texto a indexar
     * @param {*} documentId ID del documento al que pertenecen los chunks
     */
    static async indexDocument(text, documentId) {
        // El vez de usar la función vectorStore.addDocuments, 
        // hacemos el INSERT  manual para poder incluir document_id

        const docs = await splitter.createDocuments([text]);
        const texts = docs.map((doc) => doc.pageContent);
        const vectors = await embeddings.embedDocuments(texts);

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
     * @param {*} query 
     * @returns 
     */
    static async retrieveContext(query) {
        const results = await vectorStore.similaritySearchWithScore(query, 4);
        return results.map(([doc, score]) => ({
            content: doc.pageContent,
            metadata: doc.metadata,
            similarity: score,
        }));
    }
}

export default RagService;
