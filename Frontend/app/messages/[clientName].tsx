import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import "../../global.css";

interface ChatMessage {
  id: string;
  text: string;
  sender: 'consultant' | 'client';
  timestamp: string;
}

const SYNTHETIC_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    text: 'Hi! How are you doing today?',
    sender: 'consultant',
    timestamp: '10:00 AM',
  },
  {
    id: '2',
    text: 'I\'m doing okay, just been feeling a bit stressed lately',
    sender: 'client',
    timestamp: '10:02 AM',
  },
  {
    id: '3',
    text: 'I understand. Can you tell me more about what\'s been causing the stress?',
    sender: 'consultant',
    timestamp: '10:03 AM',
  },
  {
    id: '4',
    text: 'Work has been overwhelming. There are so many deadlines and expectations.',
    sender: 'client',
    timestamp: '10:05 AM',
  },
  {
    id: '5',
    text: 'That sounds challenging. Have you tried any of the breathing exercises we discussed in our last session?',
    sender: 'consultant',
    timestamp: '10:06 AM',
  },
  {
    id: '6',
    text: 'Yes, I have been trying them. They do help when I remember to use them.',
    sender: 'client',
    timestamp: '10:08 AM',
  },
  {
    id: '7',
    text: 'That\'s great to hear! It\'s important to practice regularly so it becomes a habit. Would you like to talk about prioritizing your tasks?',
    sender: 'consultant',
    timestamp: '10:10 AM',
  },
  {
    id: '8',
    text: 'That would be helpful. I feel like everything is equally urgent.',
    sender: 'client',
    timestamp: '10:12 AM',
  },
  {
    id: '9',
    text: 'Let\'s break this down together. We can use the Eisenhower matrix to categorize your tasks. Should we schedule a session to dive deeper into this?',
    sender: 'consultant',
    timestamp: '10:15 AM',
  },
  {
    id: '10',
    text: 'Yes, that sounds great! When are you available?',
    sender: 'client',
    timestamp: '10:17 AM',
  },
];

export default function ConversationScreen() {
  const router = useRouter();
  const { clientName } = useLocalSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>(SYNTHETIC_MESSAGES);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: String(messages.length + 1),
        text: newMessage,
        sender: 'consultant',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const MessageBubble = ({ message }: { message: ChatMessage }) => {
    const isConsultant = message.sender === 'consultant';

    return (
      <View style={[styles.messageContainer, isConsultant ? styles.consultantContainer : styles.clientContainer]}>
        <View style={[styles.bubble, isConsultant ? styles.consultantBubble : styles.clientBubble]}>
          <Text style={[styles.messageText, isConsultant ? styles.consultantText : styles.clientText]}>
            {message.text}
          </Text>
          <Text style={[styles.timestamp, isConsultant ? styles.consultantTimestamp : styles.clientTimestamp]}>
            {message.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={28} color="#4f46e5" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{clientName || 'Client'}</Text>
          <Text style={styles.headerStatus}>Active now</Text>
        </View>
        <TouchableOpacity style={styles.callButton}>
          <Ionicons name="call-outline" size={24} color="#4f46e5" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        scrollEnabled={true}
        contentContainerStyle={styles.messagesContainer}
        inverted={false}
        onEndReachedThreshold={0.5}
      />

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor="#d1d5db"
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={styles.attachButton}
            onPress={() => {
              // Placeholder for file attachment
            }}
          >
            <Ionicons name="attach-outline" size={20} color="#4f46e5" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        >
          <Ionicons name="send" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  headerStatus: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 2,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  messageContainer: {
    marginVertical: 6,
    flexDirection: 'row',
  },
  consultantContainer: {
    justifyContent: 'flex-start',
  },
  clientContainer: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  consultantBubble: {
    backgroundColor: '#e5e7eb',
  },
  clientBubble: {
    backgroundColor: '#4f46e5',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  consultantText: {
    color: '#1f2937',
  },
  clientText: {
    color: '#ffffff',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  consultantTimestamp: {
    color: '#6b7280',
  },
  clientTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
    alignItems: 'flex-end',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1f2937',
    maxHeight: 100,
  },
  attachButton: {
    padding: 4,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
});
