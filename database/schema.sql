-- =============================================
-- RAG: carpetas, documentos y chunks vectoriales
-- =============================================

-- Extensión pgvector (necesaria para el tipo vector y el operador <=>)
CREATE EXTENSION IF NOT EXISTS vector;

-- Carpetas para organizar documentos en el dashboard
CREATE TABLE folders (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Metadatos de cada documento fuente (PDF, URL...)
-- El ciclo de vida (activo, caducado) se gestiona aquí, no en los chunks
CREATE TABLE documents (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    folder_id BIGINT REFERENCES folders (id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (
        source_type IN ('file', 'url')
    ),
    source_uri TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chunks de texto con su embedding (tabla que lee/escribe LangChain directamente)
-- ON DELETE CASCADE: borrar un documento borra todos sus chunks automáticamente
CREATE TABLE document_chunks (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    document_id BIGINT NOT NULL REFERENCES documents (id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    metadata JSONB,
    embedding vector (1536),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Función RPC que invoca LangChain al hacer similarity search.
-- El JOIN con documents filtra chunks de documentos inactivos o caducados.
CREATE OR REPLACE FUNCTION match_document_chunks(
    query_embedding vector(1536),
    match_count INT DEFAULT 4,
    filter JSONB DEFAULT '{}'
) RETURNS TABLE(
    id BIGINT,
    content TEXT,
    metadata JSONB,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.content,
        dc.metadata,
        1 - (dc.embedding <=> query_embedding) AS similarity
    FROM document_chunks dc
    JOIN documents d ON d.id = dc.document_id
    WHERE d.is_active = TRUE
        AND (d.expires_at IS NULL OR d.expires_at > NOW())
        AND dc.metadata @> filter
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- =============================================
-- Chat: conversaciones y mensajes
-- =============================================

-- Conversaciones
CREATE TABLE conversations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    conversation_token UUID UNIQUE NOT NULL,
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active' CHECK (
        status IN ('active', 'closed')
    )
);

-- Mensajes de cada conversación
CREATE TABLE messages (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    sender_type TEXT NOT NULL CHECK (
        sender_type IN ('user', 'assistant')
    ),
    sources JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
);