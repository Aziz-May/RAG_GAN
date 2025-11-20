# RAG Service Integration Guide

## Overview

The RAG (Retrieval-Augmented Generation) service provides AI-powered parenting guidance by combining:
- **Vector Search**: Retrieves relevant passages from indexed parenting articles
- **LLM Generation**: Uses OpenRouter to generate comprehensive, contextual answers
- **Source Attribution**: Returns the source documents used for each answer

## Architecture

```
rag_assets/
├── rag_core.py          # Main RAG pipeline logic
├── llm.py               # OpenRouter LLM client wrapper
├── embeddings.py        # Sentence transformer embeddings
├── vectorstore_build.py # Script to build/rebuild vector database
├── chroma_db/          # ChromaDB vector storage
└── data/               # Source PDFs and documents

app/
├── services/
│   └── rag.py          # FastAPI service wrapper
└── routers/
    └── rag.py          # API endpoints
```

## Setup

### 1. Build the Vector Database

First time setup or after adding new documents:

```bash
cd Backend
python -m rag_assets.vectorstore_build
```

This will:
- Load PDFs from `rag_assets/data/`
- Split into chunks
- Generate embeddings
- Store in ChromaDB

### 2. Configure Environment Variables

In your `.env` file:

```env
# Required for RAG
OPENROUTER_API_KEY=sk-or-v1-...
CHROMA_DIR=./rag_assets/chroma_db
```

### 3. Verify Service Status

```bash
# Test the RAG service
python test_rag_service.py

# Or test with uvicorn running:
curl http://localhost:8000/rag/status
```

## API Endpoints

### 1. POST /rag/query - Ask a Question

**Request:**
```json
POST /rag/query
{
  "question": "How can I support my child's emotional development?",
  "top_k": 3  // Optional: number of sources to retrieve (1-10)
}
```

**Response:**
```json
{
  "question": "How can I support my child's emotional development?",
  "answer": "Based on the provided sources, here's how you can support...",
  "chunks": [
    {
      "id": "Raising Good Humans PDF.pdf-chunk-4633",
      "text": "Model healthy emotional regulation...",
      "source": "Raising Good Humans PDF.pdf"
    }
  ],
  "prompt": "You are a parenting assistant...",
  "error": null
}
```

### 2. GET /rag/query - Ask a Question (URL params)

Convenient for quick queries:

```bash
curl "http://localhost:8000/rag/query?question=How+do+I+handle+tantrums?&top_k=3"
```

### 3. GET /rag/status - Service Status

Check RAG service health and configuration:

```bash
curl http://localhost:8000/rag/status
```

**Response:**
```json
{
  "ready": true,
  "collection": "parenting_articles",
  "document_count": 8238,
  "chroma_dir": "/path/to/chroma_db",
  "model": "tngtech/deepseek-r1t2-chimera:free"
}
```

### 4. GET /rag/health - Quick Health Check

```bash
curl http://localhost:8000/rag/health
```

**Response:**
```json
{
  "service": "rag",
  "ready": true,
  "status": "ok"
}
```

## Testing

### Run Integration Tests

```bash
cd Backend
pytest tests/test_rag.py -v
```

### Manual Testing

```bash
# Test the service directly
python test_rag_service.py

# Test via API
curl -X POST http://localhost:8000/rag/query \
  -H "Content-Type: application/json" \
  -d '{"question": "How can I help my child with anxiety?"}'
```

## Example Questions

The RAG service works best with parenting-related questions:

- "How can I support my child's emotional development?"
- "What are effective strategies for managing toddler tantrums?"
- "How do I talk to my teenager about difficult topics?"
- "What are age-appropriate chores for a 7-year-old?"
- "How can I help my child with test anxiety?"
- "What are signs of learning difficulties in children?"

## Configuration

Key settings in `app/core/config.py`:

```python
# Vector Database
CHROMA_DIR: Path              # Location of ChromaDB storage
CHROMA_COLLECTION: str        # Collection name

# Embeddings
EMBEDDING_MODEL_NAME: str     # HuggingFace model for embeddings

# Text Splitting
CHUNK_SIZE: int = 1000       # Characters per chunk
CHUNK_OVERLAP: int = 100     # Overlap between chunks

# LLM
LLM_MODEL: str               # OpenRouter model
OPENROUTER_API_KEY: str      # API key

# Retrieval
DEFAULT_TOP_K: int = 3       # Default sources to retrieve

# Prompt
PROMPT_TEMPLATE: str         # System prompt template
```

## Troubleshooting

### Service Not Ready

**Error:** `"RAG service is not available"`

**Solutions:**
1. Build the vector database: `python -m rag_assets.vectorstore_build`
2. Check ChromaDB path exists: `CHROMA_DIR` in `.env`
3. Verify documents are in `rag_assets/data/`

### No Answer Generated

**Error:** `"[LLM unavailable] Unable to retrieve..."`

**Solutions:**
1. Check `OPENROUTER_API_KEY` is set
2. Verify API key is valid
3. Check internet connectivity
4. Review OpenRouter API quotas

### Import Errors

**Error:** `Import "rag_core" could not be resolved`

This is expected - it's a dynamic import and the linter warning can be ignored.

### Empty Results

If queries return no relevant chunks:
1. Check question is parenting-related
2. Try broader/simpler phrasing
3. Verify documents are properly indexed
4. Increase `top_k` parameter

## Frontend Integration

### Example API Call (TypeScript)

```typescript
// services/api/rag.ts
import httpClient from '../http';

export interface RAGQuery {
  question: string;
  top_k?: number;
}

export interface RAGResponse {
  question: string;
  answer: string;
  chunks: Array<{
    id: string;
    text: string;
    source: string;
  }>;
  error?: string;
}

export const ragAPI = {
  query: async (query: RAGQuery): Promise<RAGResponse> => {
    const resp = await httpClient.post<RAGResponse>('/rag/query', query);
    if (!resp.success || !resp.data) {
      throw new Error(resp.error || 'RAG query failed');
    }
    return resp.data;
  },

  getStatus: async () => {
    const resp = await httpClient.get('/rag/status');
    return resp.data;
  }
};
```

### Example React Component

```typescript
import { useState } from 'react';
import { ragAPI } from '@/services/api/rag';

export function AskExpertButton() {
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  const askQuestion = async (question: string) => {
    setLoading(true);
    try {
      const result = await ragAPI.query({ question, top_k: 3 });
      setAnswer(result.answer);
    } catch (error) {
      console.error('RAG error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Button 
        title="Ask Expert" 
        onPress={() => askQuestion("How do I handle tantrums?")}
        loading={loading}
      />
      {answer && <Text>{answer}</Text>}
    </View>
  );
}
```

## Performance Notes

- **Cold start**: First query takes ~2-3 seconds (model loading)
- **Warm queries**: Subsequent queries ~500ms-1s
- **Embeddings**: Cached in ChromaDB, very fast retrieval
- **LLM**: Depends on OpenRouter API latency

## Adding New Documents

1. Place PDFs in `rag_assets/data/`
2. Run: `python -m rag_assets.vectorstore_build`
3. Restart the API server
4. Verify: `curl http://localhost:8000/rag/status`

## Security Notes

- RAG queries don't require authentication (public knowledge)
- Consider rate limiting for production
- OpenRouter API key should be in `.env`, never committed
- Source documents are public parenting resources

## Future Enhancements

- [ ] Add authentication for personalized responses
- [ ] Cache frequent queries
- [ ] Add feedback mechanism for answer quality
- [ ] Support multiple languages
- [ ] Add conversation history/context
- [ ] Implement streaming responses
- [ ] Add source preview/full text retrieval
