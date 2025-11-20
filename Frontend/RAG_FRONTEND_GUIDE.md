# RAG API Frontend Integration

## Overview

The RAG API service (`services/api/rag.ts`) provides a complete client for querying the backend RAG system from your React Native/Expo app.

## Quick Start

### 1. Import the RAG API

```typescript
import { ragAPI, EXAMPLE_QUESTIONS } from '@/services/api/rag';
```

### 2. Basic Query

```typescript
const handleAskQuestion = async () => {
  try {
    const result = await ragAPI.query({
      question: "How can I support my child's emotional development?",
      top_k: 3 // Optional: number of sources to retrieve (1-10)
    });
    
    console.log('Answer:', result.answer);
    console.log('Sources:', result.chunks.length);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## API Methods

### `ragAPI.query(request)`

Main method for querying the RAG system.

**Parameters:**
- `question` (string, required): The parenting question (5-500 chars)
- `top_k` (number, optional): Number of sources to retrieve (1-10, default: 3)

**Returns:** `RAGQueryResponse`
```typescript
{
  question: string;
  answer: string;           // AI-generated answer
  chunks: SourceChunk[];    // Source documents used
  prompt?: string;          // System prompt (optional)
  error?: string;           // Error message if any
}
```

**Example:**
```typescript
const result = await ragAPI.query({
  question: "What are good bedtime routines?",
  top_k: 3
});

console.log(result.answer);
result.chunks.forEach(chunk => {
  console.log(`- ${chunk.source}: ${chunk.text.substring(0, 100)}...`);
});
```

### `ragAPI.queryGet(question, top_k?)`

Alternative GET-based query (same functionality).

**Parameters:**
- `question` (string, required)
- `top_k` (number, optional)

**Example:**
```typescript
const result = await ragAPI.queryGet(
  "How do I handle tantrums?",
  3
);
```

### `ragAPI.getStatus()`

Get RAG service status and configuration.

**Returns:** `RAGStatus`
```typescript
{
  ready: boolean;
  collection?: string;
  document_count?: number;
  chroma_dir?: string;
  model?: string;
  message?: string;
  error?: string;
}
```

**Example:**
```typescript
const status = await ragAPI.getStatus();
if (status.ready) {
  console.log(`${status.document_count} documents available`);
} else {
  console.log('RAG service not ready:', status.message);
}
```

### `ragAPI.healthCheck()`

Quick health check.

**Returns:** `RAGHealth`
```typescript
{
  service: string;
  ready: boolean;
  status: string;
}
```

**Example:**
```typescript
const health = await ragAPI.healthCheck();
console.log(`RAG service: ${health.status}`);
```

## React Component Example

See `components/examples/RAGQueryExample.tsx` for a complete working example.

Basic pattern:

```tsx
import React, { useState } from 'react';
import { ragAPI, type RAGQueryResponse } from '@/services/api/rag';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function AskExpertButton() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RAGQueryResponse | null>(null);

  const handleAsk = async () => {
    setLoading(true);
    try {
      const response = await ragAPI.query({ question, top_k: 3 });
      setResult(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Input
        value={question}
        onChangeText={setQuestion}
        placeholder="Ask a parenting question..."
      />
      <Button
        title="Ask Expert"
        onPress={handleAsk}
        loading={loading}
      />
      {result && (
        <View>
          <Text>{result.answer}</Text>
          {result.chunks.map((chunk, i) => (
            <Text key={i}>Source: {chunk.source}</Text>
          ))}
        </View>
      )}
    </View>
  );
}
```

## Example Questions

Use the exported `EXAMPLE_QUESTIONS` array for suggestions:

```typescript
import { EXAMPLE_QUESTIONS } from '@/services/api/rag';

// Display as suggestions
EXAMPLE_QUESTIONS.forEach(q => console.log(q));

// Or in a component:
{EXAMPLE_QUESTIONS.map((question, index) => (
  <TouchableOpacity
    key={index}
    onPress={() => setQuestion(question)}
  >
    <Text>{question}</Text>
  </TouchableOpacity>
))}
```

Example questions include:
- "How can I support my child's emotional development?"
- "What are effective strategies for managing toddler tantrums?"
- "How do I talk to my teenager about difficult topics?"
- And 7 more...

## TypeScript Types

All types are exported from `services/api/rag.ts`:

```typescript
import type {
  SourceChunk,
  RAGQueryRequest,
  RAGQueryResponse,
  RAGStatus,
  RAGHealth
} from '@/services/api/rag';
```

### `SourceChunk`
```typescript
{
  id: string;        // Document chunk ID
  text: string;      // Content excerpt
  source: string;    // Source document name
}
```

## Error Handling

The RAG API throws errors that should be caught:

```typescript
try {
  const result = await ragAPI.query({ question: userQuestion });
  // Success
} catch (error) {
  if (error instanceof Error) {
    Alert.alert('Error', error.message);
  } else {
    Alert.alert('Error', 'Failed to get answer');
  }
}
```

Common errors:
- Network errors (backend not reachable)
- Validation errors (question too short)
- Service errors (RAG not initialized)

## Integration Points

### Chat Screen
Add an "Ask Expert" button to the chat interface:

```typescript
import { ragAPI } from '@/services/api/rag';

const askExpert = async (userMessage: string) => {
  const result = await ragAPI.query({ question: userMessage });
  // Display result.answer in chat
};
```

### Profile/Help Screen
Create a dedicated "Parenting Tips" section:

```typescript
const [ragResult, setRagResult] = useState(null);

const loadTip = async (question: string) => {
  const result = await ragAPI.query({ question, top_k: 2 });
  setRagResult(result);
};
```

### Search/Browse
Show example questions users can explore:

```typescript
import { EXAMPLE_QUESTIONS } from '@/services/api/rag';

<FlatList
  data={EXAMPLE_QUESTIONS}
  renderItem={({ item }) => (
    <TouchableOpacity onPress={() => navigate('RAGQuery', { question: item })}>
      <Text>{item}</Text>
    </TouchableOpacity>
  )}
/>
```

## Testing

Test the API in your app:

```typescript
// Test basic query
const testRAG = async () => {
  console.log('Testing RAG API...');
  
  // Health check
  const health = await ragAPI.healthCheck();
  console.log('Health:', health);
  
  // Status
  const status = await ragAPI.getStatus();
  console.log('Status:', status);
  
  // Query
  const result = await ragAPI.query({
    question: "How can I help my child with anxiety?",
    top_k: 3
  });
  console.log('Answer length:', result.answer.length);
  console.log('Sources:', result.chunks.length);
};

testRAG();
```

## Best Practices

1. **Show Loading State**: RAG queries take 1-3 seconds
2. **Validate Input**: Min 5 characters, max 500
3. **Display Sources**: Show chunk sources for credibility
4. **Cache Results**: Consider caching frequent questions
5. **Error Feedback**: Provide clear error messages to users
6. **Placeholder Text**: Guide users with example questions

## Performance Notes

- **Cold Start**: First query ~2-3 seconds
- **Subsequent**: ~500ms-1s
- **Network**: Depends on API_BASE_URL latency
- **Recommendation**: Show loading indicator

## Environment

Ensure `EXPO_PUBLIC_API_URL` is set:

```bash
# .env or inline
EXPO_PUBLIC_API_URL=https://your-backend.ngrok-free.app

# Then
npx expo start --tunnel
```

## Troubleshooting

### "RAG service is not available"
Backend RAG service not initialized. Run:
```bash
cd Backend
python -m rag_assets.vectorstore_build
```

### "Network error"
Check `EXPO_PUBLIC_API_URL` points to running backend.

### "[LLM unavailable]"
Backend's `OPENROUTER_API_KEY` not set or invalid.

### No results
Check that question is parenting-related and properly phrased.

## Next Steps

1. Add RAG query to existing chat/profile screens
2. Create dedicated "Ask Expert" tab
3. Show featured questions on home screen
4. Add history/favorites for RAG queries
5. Implement conversation context (multi-turn)
