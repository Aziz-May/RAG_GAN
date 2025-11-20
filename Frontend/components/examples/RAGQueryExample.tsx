/**
 * Example: RAG Query Component
 * 
 * Demonstrates how to use the RAG API service to ask parenting questions
 * and display AI-generated answers with source attribution.
 * 
 * Usage:
 * - Import this component into any screen
 * - Or copy the patterns to implement in existing screens
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ragAPI, EXAMPLE_QUESTIONS, type RAGQueryResponse } from '@/services/api/rag';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Ionicons } from '@expo/vector-icons';

export default function RAGQueryExample() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RAGQueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleQuery = async () => {
    if (!question.trim() || question.length < 5) {
      setError('Please enter a question (at least 5 characters)');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await ragAPI.query({
        question: question.trim(),
        top_k: 3, // Get top 3 relevant sources
      });

      setResult(response);

      // Check if there's an error in the response
      if (response.error) {
        setError(response.error);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get answer');
    } finally {
      setLoading(false);
    }
  };

  const loadExampleQuestion = (exampleQuestion: string) => {
    setQuestion(exampleQuestion);
    setResult(null);
    setError(null);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      {/* Header */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Ask a Parenting Expert
        </Text>
        <Text className="text-base text-gray-600">
          Get AI-powered guidance based on expert parenting resources
        </Text>
      </View>

      {/* Input Section */}
      <Card className="mb-4">
        <Input
          label="Your Question"
          placeholder="e.g., How can I help my child with anxiety?"
          value={question}
          onChangeText={setQuestion}
          multiline
          numberOfLines={3}
          error={error || undefined}
        />

        <Button
          title={loading ? 'Getting Answer...' : 'Ask Question'}
          onPress={handleQuery}
          loading={loading}
          disabled={loading || question.length < 5}
          className="mt-4"
        />
      </Card>

      {/* Example Questions */}
      {!result && (
        <Card className="mb-4">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Example Questions:
          </Text>
          {EXAMPLE_QUESTIONS.slice(0, 5).map((example, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => loadExampleQuestion(example)}
              className="py-2 border-b border-gray-200 last:border-b-0"
            >
              <Text className="text-sm text-blue-600">
                • {example}
              </Text>
            </TouchableOpacity>
          ))}
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="items-center py-8">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="text-gray-600 mt-4">
            Analyzing your question...
          </Text>
        </Card>
      )}

      {/* Result */}
      {result && !loading && (
        <>
          {/* Answer Card */}
          <Card className="mb-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="chatbubble-ellipses" size={24} color="#2563eb" />
              <Text className="text-lg font-semibold text-gray-900 ml-2">
                Answer
              </Text>
            </View>
            <Text className="text-base text-gray-800 leading-6">
              {result.answer}
            </Text>
          </Card>

          {/* Sources Card */}
          {result.chunks && result.chunks.length > 0 && (
            <Card>
              <View className="flex-row items-center mb-3">
                <Ionicons name="book" size={24} color="#059669" />
                <Text className="text-lg font-semibold text-gray-900 ml-2">
                  Sources Used ({result.chunks.length})
                </Text>
              </View>

              {result.chunks.map((chunk, index) => (
                <View
                  key={chunk.id}
                  className="mb-3 p-3 bg-gray-50 rounded-lg last:mb-0"
                >
                  <Text className="text-xs font-semibold text-gray-700 mb-1">
                    Source {index + 1}: {chunk.source}
                  </Text>
                  <Text className="text-sm text-gray-600 leading-5" numberOfLines={3}>
                    {chunk.text}
                  </Text>
                </View>
              ))}
            </Card>
          )}

          {/* Ask Another Question */}
          <TouchableOpacity
            onPress={() => {
              setQuestion('');
              setResult(null);
              setError(null);
            }}
            className="mt-4 py-3 items-center"
          >
            <Text className="text-blue-600 font-semibold">
              Ask Another Question
            </Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

/**
 * INTEGRATION EXAMPLES:
 * 
 * 1. Simple Query (async/await):
 * ```typescript
 * try {
 *   const result = await ragAPI.query({
 *     question: "How do I handle tantrums?",
 *     top_k: 3
 *   });
 *   console.log(result.answer);
 * } catch (error) {
 *   console.error(error);
 * }
 * ```
 * 
 * 2. GET Request Alternative:
 * ```typescript
 * const result = await ragAPI.queryGet("What are good bedtime routines?", 3);
 * ```
 * 
 * 3. Check Service Status:
 * ```typescript
 * const status = await ragAPI.getStatus();
 * if (status.ready) {
 *   console.log(`${status.document_count} documents available`);
 * }
 * ```
 * 
 * 4. Health Check:
 * ```typescript
 * const health = await ragAPI.healthCheck();
 * console.log(`Service: ${health.status}`);
 * ```
 */
