import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import "../../global.css";

interface Message {
  id: string;
  senderName: string;
  senderAvatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
}

const SYNTHETIC_CONVERSATIONS: Message[] = [
  {
    id: '1',
    senderName: 'Sarah Johnson',
    senderAvatar: 'SJ',
    lastMessage: 'Thank you for the advice, it really helped!',
    timestamp: '2 min ago',
    unreadCount: 0,
    isOnline: true,
  },
  {
    id: '2',
    senderName: 'Michael Chen',
    senderAvatar: 'MC',
    lastMessage: 'Can we reschedule our session?',
    timestamp: '1 hour ago',
    unreadCount: 1,
    isOnline: true,
  },
  {
    id: '3',
    senderName: 'Emma Davis',
    senderAvatar: 'ED',
    lastMessage: 'I have been practicing the exercises you suggested',
    timestamp: '3 hours ago',
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: '4',
    senderName: 'John Smith',
    senderAvatar: 'JS',
    lastMessage: 'Looking forward to our next session',
    timestamp: 'Yesterday',
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: '5',
    senderName: 'Lisa Anderson',
    senderAvatar: 'LA',
    lastMessage: 'Thanks for checking in on me',
    timestamp: '2 days ago',
    unreadCount: 0,
    isOnline: true,
  },
  {
    id: '6',
    senderName: 'Robert Wilson',
    senderAvatar: 'RW',
    lastMessage: 'I have some concerns about my progress',
    timestamp: '3 days ago',
    unreadCount: 2,
    isOnline: false,
  },
];

export default function MessagesScreen() {
  const [searchText, setSearchText] = useState('');
  const router = useRouter();

  const filteredConversations = SYNTHETIC_CONVERSATIONS.filter(conv =>
    conv.senderName.toLowerCase().includes(searchText.toLowerCase())
  );

  const totalUnread = SYNTHETIC_CONVERSATIONS.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const ConversationItem = ({ message }: { message: Message }) => (
    <TouchableOpacity 
      style={styles.conversationItem}
      onPress={() => router.push({ pathname: '/messages/[clientName]', params: { clientName: message.senderName } })}
    >
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, { backgroundColor: '#4f46e5' }]}>
          <Text style={styles.avatarText}>{message.senderAvatar}</Text>
        </View>
        {message.isOnline && <View style={styles.onlineBadge} />}
      </View>

      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.senderName}>{message.senderName}</Text>
          <Text style={styles.timestamp}>{message.timestamp}</Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {message.lastMessage}
        </Text>
      </View>

      {message.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{message.unreadCount}</Text>
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

      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
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
