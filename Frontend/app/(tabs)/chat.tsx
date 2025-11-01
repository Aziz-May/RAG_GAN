import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import '../../global.css';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Thank you for your message! This is a placeholder response. RAG integration will be added later.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View className="bg-blue-600 pt-16 pb-6 px-6">
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center mr-4">
            <Ionicons name="chatbubbles" size={24} color="white" />
          </View>
          <View>
            <Text className="text-2xl font-bold text-white">AI Assistant</Text>
            <Text className="text-sm text-blue-100">Always here to help</Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4 py-4"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isTyping && (
          <View className="flex-row items-center mb-4">
            <View className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 max-w-[75%] shadow-sm">
              <View className="flex-row gap-1">
                <View className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
                <View className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <View className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View className="bg-white border-t border-gray-200 px-4 py-3">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
          <TextInput
            className="flex-1 text-base text-gray-900 py-2"
            placeholder="Type your message..."
            placeholderTextColor="#9ca3af"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputText.trim()}
            className={`ml-2 w-10 h-10 rounded-full items-center justify-center ${
              inputText.trim() ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <Ionicons
              name="send"
              size={20}
              color="white"
            />
          </TouchableOpacity>
        </View>
        <Text className="text-xs text-gray-500 text-center mt-2">
          RAG integration coming soon
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({ message }: { message: Message }) {
  return (
    <View
      className={`flex-row mb-4 ${message.isUser ? 'justify-end' : 'justify-start'}`}
    >
      <View
        className={`rounded-2xl px-4 py-3 max-w-[75%] shadow-sm ${
          message.isUser
            ? 'bg-blue-600 rounded-br-sm'
            : 'bg-white rounded-bl-sm'
        }`}
      >
        <Text
          className={`text-base ${
            message.isUser ? 'text-white' : 'text-gray-900'
          }`}
        >
          {message.text}
        </Text>
        <Text
          className={`text-xs mt-1 ${
            message.isUser ? 'text-blue-100' : 'text-gray-500'
          }`}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
}
