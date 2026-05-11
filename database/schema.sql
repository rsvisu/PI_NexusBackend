CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE EXTENSION IF NOT EXISTS vector;

-- Conversaciones
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    conversation_token UUID UNIQUE NOT NULL,
    started_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'active' CHECK (
            status IN ('active', 'closed')
        )
);

-- Mensajes de cada conversación
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    conversation_id UUID NOT NULL,
    content TEXT NOT NULL,
    sender_type TEXT NOT NULL CHECK (
        sender_type IN ('user', 'assistant')
    ),
    sources JSONB,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
);