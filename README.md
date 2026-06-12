# Nexus — Backend

API REST en Express 5 para el asistente conversacional de CPIFP Los Enlaces. Sirve al widget de chat (con RAG sobre la documentación del centro) y al dashboard de administración.

## Requisitos

- Node 24.x
- pnpm (no usar `npm install`, rompe el lockfile)
- Proyecto de Supabase con el esquema de `database/schema.sql` aplicado

## Instalación

```bash
pnpm install
cp .env.example .env
```

Variables de entorno (`.env`):

| Variable                  | Obligatoria | Descripción                                                                |
| -------------------------- | ----------- | --------------------------------------------------------------------------- |
| `OPENAI_API_KEY`            | Sí*         | Clave de OpenAI. Si se define, sobrescribe la guardada desde el dashboard. |
| `SUPABASE_URL`              | Sí          | URL del proyecto de Supabase.                                              |
| `SUPABASE_SERVICE_KEY`      | Sí          | Service role key de Supabase (acceso total, solo backend).                |
| `PORT`                      | No          | Puerto del servidor. Por defecto `3000`.                                   |
| `OPENAI_MODEL`              | No          | Modelo de chat. Por defecto `gpt-4o-mini`.                                 |
| `OPENAI_EMBEDDING_MODEL`    | No          | Modelo de embeddings. Por defecto `text-embedding-3-small`.                |
| `ALLOWED_ORIGINS`           | No          | Orígenes permitidos para CORS, separados por comas. Vacío = abierto (solo desarrollo). |
| `UPLOAD_MAX_SIZE_MB`        | No          | Tamaño máximo de subida de documentos. Por defecto `5`.                    |

\* En producción no se define: manda la API key guardada desde el dashboard (tabla `system_config`).

## Comandos

```bash
pnpm run dev     # node --watch server.js (hot reload)
pnpm run start   # producción
pnpm test        # node --test tests/index.test.js
```

## Arquitectura

### Capas de una petición

```text
CORS / JSON / Morgan (globales)
  → rate limiter (solo POST /api/chat)
  → authMiddleware (solo rutas privadas)
  → router → controller (valida y orquesta)
  → model (queries Supabase) y/o service (RAG, LLM, Storage)
  → Supabase
```

El controller nunca llama a Supabase directamente: eso vive siempre en un model o un service.

### Rutas públicas vs privadas

- `server.js` monta `authMiddleware` por router completo (`app.use('/api/conversation', authMiddleware, conversationsRouter)`), no endpoint a endpoint. Un endpoint nuevo dentro de ese router queda protegido automáticamente, sin riesgo de olvidarlo.
- **Públicas:** `/api/chat` (y subrutas), `/api/config/public`, `/api/status`. Las usa el widget, sin usuarios con sesión.
- **Privadas:** el resto. Requieren el JWT del admin logueado en el dashboard, verificado contra Supabase Auth (no es solo decodificar el token: también comprueba que no haya sido revocado).

### CORS

- `ALLOWED_ORIGINS` (lista separada por comas) alimenta `config.app.allowedOrigins`; vacío equivale a `origin: '*'`, pensado solo para desarrollo.
- `app.set('trust proxy', 1)` es necesario en producción para que el rate limiter lea la IP real del visitante detrás del proxy de Coolify.

## Estructura

- `config/` — configuración centralizada de la aplicación
- `routes/` — definición de endpoints
- `controllers/` — lógica de petición/respuesta
- `models/` — acceso a datos (Supabase)
- `services/` — lógica de negocio (RAG, LLM, Storage)
- `schemas/` — validación de payloads con Zod
- `middlewares/` — auth, rate limiting, manejo de errores, subida de ficheros
- `errors/` — errores HTTP conocidos
- `database/` — cliente de Supabase y esquema de la BD
- `utils/` — funciones auxiliares
- `knowledge-base/` — documentos fuente (PDF/MD/TXT) usados para la ingesta del RAG, organizados por ámbito. Copia de referencia local: la fuente de verdad en producción es Supabase Storage + `document_chunks`
- `tests/` — pruebas con `node --test`

## Rutas

### Públicas (las usa el widget)

| Método | Ruta                        | Descripción                                                       |
| ------ | --------------------------- | ------------------------------------------------------------------ |
| POST   | `/api/chat`                 | Envía un mensaje y obtiene respuesta del asistente. Rate limit (configurable, 10 req/min/IP por defecto). |
| GET    | `/api/chat/history/:token`  | Carga el historial por `conversation_token`.                      |
| DELETE | `/api/chat/history/:token`  | Borra una conversación ("olvidar mis datos").                     |
| POST   | `/api/chat/feedback`        | Registra el voto (positivo/negativo) de un mensaje.                |
| GET    | `/api/config/public`        | Config no sensible para el widget (saludo, sugerencias).          |
| GET    | `/api/status`                | Health check.                                                      |

### Privadas (requieren JWT, las usa el dashboard)

| Método | Ruta                          | Descripción                          |
| ------ | ----------------------------- | --------------------------------------- |
| GET    | `/api/conversation`           | Lista conversaciones.                |
| GET    | `/api/conversation/:id`       | Mensajes de una conversación.        |
| DELETE | `/api/conversation/:id`       | Borra una conversación por id.       |
| GET    | `/api/document`               | Lista documentos.                    |
| GET    | `/api/document/:id/url`       | URL firmada para descargar.          |
| POST   | `/api/document/file`          | Sube un documento e indexa en el RAG.|
| PATCH  | `/api/document/:id`           | Edita nombre, carpeta o expiración.  |
| PATCH  | `/api/document/:id/active`    | Activa/desactiva un documento.       |
| DELETE | `/api/document/:id`           | Borra un documento.                  |
| GET    | `/api/folder`                 | Lista carpetas.                      |
| POST   | `/api/folder`                 | Crea una carpeta.                    |
| PATCH  | `/api/folder/:id`              | Renombra una carpeta.                |
| DELETE | `/api/folder/:id`              | Borra una carpeta.                   |
| GET    | `/api/feedback`                | Lista el feedback registrado.        |
| PATCH  | `/api/feedback/:id/reviewed`   | Marca un feedback como revisado.     |
| GET    | `/api/config`                  | Configuración actual + defaults.     |
| PATCH  | `/api/config`                  | Actualiza la configuración.          |
| GET    | `/api/stats`                   | Métricas para el panel de inicio.    |
