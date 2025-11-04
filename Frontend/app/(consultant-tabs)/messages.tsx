import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import "../../global.css";
import { messagesAPI, BackendConversation } from '@/services/api/messages';

interface Message {
  id: string;
  senderName: string;
  senderAvatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
}

const formatTime = (iso?: string | null) => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const now = Date.now();
    const diffMs = now - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'now';
    if (diffMin < 60) return `${diffMin}m`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay === 1) return 'Yesterday';
    return d.toLocaleDateString();
  } catch {
    return '';
  }
};

export default function MessagesScreen() {
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<BackendConversation[]>([]);
  const router = useRouter();

  const filteredConversations = items.filter(conv =>
    conv.other_user_name.toLowerCase().includes(searchText.toLowerCase())
  );

  const totalUnread = items.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await messagesAPI.listConversations();
      setItems(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const ConversationItem = ({ message }: { message: any }) => (
    <TouchableOpacity 
      style={styles.conversationItem}
      onPress={() => router.push({ pathname: '/messages/[clientName]', params: { clientName: message.other_user_name, otherUserId: message.other_user_id } })}
    >
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, { backgroundColor: '#4f46e5' }]}>
          <Text style={styles.avatarText}>{message.other_user_name.split(' ').map((p: string) => p[0]).join('').slice(0,2).toUpperCase()}</Text>
        </View>
        {/* online badge not supported yet */}
      </View>

      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.senderName}>{message.other_user_name}</Text>
          <Text style={styles.timestamp}>{formatTime(message.last_message_time)}</Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {message.last_message}
        </Text>
      </View>

      {message.unread_count > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{message.unread_count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Messages</Text>
          {totalUnread > 0 && (
            <Text style={styles.unreadIndicator}>{totalUnread} unread</Text>
          )}
        </View>
        <TouchableOpacity style={styles.composButton}>
          <Ionicons name="create-outline" size={24} color="#4f46e5" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#9ca3af" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor="#d1d5db"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {loading ? (
        <View style={{ padding: 24 }}>
          <ActivityIndicator color="#4f46e5" />
        </View>
      ) : error ? (
        <Text style={[styles.emptyText, { color: '#ef4444' }]}>{error}</Text>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.other_user_id}
          renderItem={({ item }) => <ConversationItem message={item} />}
          scrollEnabled={true}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>No conversations found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  unreadIndicator: {
    fontSize: 12,
    color: '#4f46e5',
    fontWeight: '600',
    marginTop: 2,
  },
  composButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#1f2937',
  },
  listContainer: {
    paddingHorizontal: 0,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
  },
  lastMessage: {
    fontSize: 13,
    color: '#6b7280',
  },
  unreadBadge: {
    backgroundColor: '#4f46e5',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },
});
