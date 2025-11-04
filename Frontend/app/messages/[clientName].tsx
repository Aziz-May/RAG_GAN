import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import "../../global.css";
import { messagesAPI, BackendMessage } from '@/services/api/messages';
import { useAuth } from '@/hooks';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'consultant' | 'client';
  timestamp: string;
}

const formatTime = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

export default function ConversationScreen() {
  const router = useRouter();
  const { clientName, otherUserId } = useLocalSearchParams<{ clientName?: string; otherUserId?: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!otherUserId) return;
    try {
      setLoading(true);
      setError(null);
      const data: BackendMessage[] = await messagesAPI.getConversation(String(otherUserId));
      const mapped: ChatMessage[] = data.map((m) => ({
        id: m.id,
        text: m.content,
        sender: m.sender_id === user?.id ? (user?.role === 'consultant' ? 'consultant' : 'client') : (user?.role === 'consultant' ? 'client' : 'consultant'),
        timestamp: formatTime(m.created_at),
      }));
      setMessages(mapped);
    } catch (e: any) {
      setError(e.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherUserId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !otherUserId) return;
    try {
      const created = await messagesAPI.sendMessage({ recipient_id: String(otherUserId), content: newMessage.trim() });
      const msg: ChatMessage = {
        id: created.id,
        text: created.content,
        sender: created.sender_id === user?.id ? (user?.role === 'consultant' ? 'consultant' : 'client') : (user?.role === 'consultant' ? 'client' : 'consultant'),
        timestamp: formatTime(created.created_at),
      };
      setMessages((prev) => [...prev, msg]);
      setNewMessage('');
    } catch (e) {
      // Optionally handle error UI
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

      {loading ? (
        <View style={{ padding: 24 }}>
          <ActivityIndicator color="#4f46e5" />
        </View>
      ) : error ? (
        <Text style={{ color: '#ef4444', textAlign: 'center', marginTop: 16 }}>{error}</Text>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          scrollEnabled={true}
          contentContainerStyle={styles.messagesContainer}
          inverted={false}
          onEndReachedThreshold={0.5}
        />
      )}

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
