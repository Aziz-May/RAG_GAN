import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import '../../global.css';
import { messagesAPI, BackendConversation } from '@/services/api/messages';

interface ConversationItemType {
  id: string;
  name: string;
  initials: string;
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

export default function ClientMessagesScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ConversationItemType[]>([]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data: BackendConversation[] = await messagesAPI.listConversations();
      const mapped: ConversationItemType[] = data.map((c) => ({
        id: c.other_user_id,
        name: c.other_user_name,
        initials: c.other_user_name
          .split(' ')
          .map((p) => p[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
        lastMessage: c.last_message || '',
        timestamp: formatTime(c.last_message_time || undefined),
        unreadCount: c.unread_count,
        isOnline: false,
      }));
      setItems(mapped);
    } catch (e: any) {
      setError(e.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const renderItem = ({ item }: { item: ConversationItemType }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => router.push({ pathname: '/messages/[clientName]', params: { clientName: item.name, otherUserId: item.id } })}
    >
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{item.initials}</Text></View>
        {item.isOnline && <View style={styles.online} />}
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.rowHeader}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>{item.timestamp}</Text>
        </View>
        <Text numberOfLines={1} style={styles.preview}>{item.lastMessage}</Text>
      </View>
      {item.unreadCount > 0 && (
        <View style={styles.unread}><Text style={styles.unreadText}>{item.unreadCount}</Text></View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Conversations</Text>
        <TouchableOpacity style={styles.compose}><Ionicons name="create-outline" size={22} color="#4f46e5"/></TouchableOpacity>
      </View>

      <View style={styles.search}>
        <Ionicons name="search-outline" size={18} color="#9ca3af" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search counselors..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <View style={{ padding: 24 }}>
          <ActivityIndicator color="#4f46e5" />
        </View>
      ) : error ? (
        <Text style={[styles.empty, { color: '#ef4444' }]}>{error}</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>No conversations yet</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  compose: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 16, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  searchInput: { flex: 1, paddingVertical: 8, paddingHorizontal: 8, color: '#111827' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  avatarWrap: { marginRight: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#4f46e5', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: 'bold' },
  online: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: '#10b981', borderWidth: 2, borderColor: '#fff' },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  name: { fontSize: 15, fontWeight: '600', color: '#111827' },
  time: { fontSize: 12, color: '#9ca3af' },
  preview: { fontSize: 13, color: '#6b7280' },
  unread: { backgroundColor: '#4f46e5', minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 24 }
});
