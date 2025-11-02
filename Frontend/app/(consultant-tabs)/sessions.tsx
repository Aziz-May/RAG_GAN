import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import "../../global.css";

interface Session {
  id: string;
  clientName: string;
  date: string;
  time: string;
  duration: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
}

const SYNTHETIC_SESSIONS: Session[] = [
  {
    id: '1',
    clientName: 'Sarah Johnson',
    date: '2025-11-05',
    time: '10:00 AM',
    duration: 60,
    status: 'upcoming',
    notes: 'Follow-up session on anxiety management',
  },
  {
    id: '2',
    clientName: 'Michael Chen',
    date: '2025-11-05',
    time: '11:30 AM',
    duration: 50,
    status: 'upcoming',
    notes: 'Initial consultation',
  },
  {
    id: '3',
    clientName: 'Emma Davis',
    date: '2025-11-04',
    time: '2:00 PM',
    duration: 60,
    status: 'completed',
    notes: 'Discussed coping mechanisms',
  },
  {
    id: '4',
    clientName: 'John Smith',
    date: '2025-11-03',
    time: '9:00 AM',
    duration: 50,
    status: 'completed',
    notes: 'Progress review',
  },
  {
    id: '5',
    clientName: 'Lisa Anderson',
    date: '2025-10-30',
    time: '3:30 PM',
    duration: 60,
    status: 'cancelled',
    notes: 'Client requested reschedule',
  },
];

export default function SessionsScreen() {
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'completed' | 'all'>('upcoming');

  const filteredSessions = selectedTab === 'all' 
    ? SYNTHETIC_SESSIONS 
    : SYNTHETIC_SESSIONS.filter(s => s.status === selectedTab);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return '#4f46e5';
      case 'completed':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'time-outline';
      case 'completed':
        return 'checkmark-circle';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const SessionCard = ({ session }: { session: Session }) => (
    <TouchableOpacity style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{session.clientName}</Text>
          <Text style={styles.sessionMeta}>
            {session.date} at {session.time}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(session.status) }]}>
          <Ionicons name={getStatusIcon(session.status)} size={16} color="#fff" />
        </View>
      </View>
      <View style={styles.sessionBody}>
        <View style={styles.durationRow}>
          <Ionicons name="hourglass-outline" size={16} color="#6b7280" />
          <Text style={styles.durationText}>{session.duration} minutes</Text>
        </View>
        {session.notes && (
          <Text style={styles.notes}>{session.notes}</Text>
        )}
      </View>
      {session.status === 'upcoming' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.joinButton}>
            <Text style={styles.joinButtonText}>Join Session</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rescheduleButton}>
            <Ionicons name="refresh-outline" size={18} color="#4f46e5" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sessions</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'upcoming' && styles.activeTab]}
          onPress={() => setSelectedTab('upcoming')}
        >
          <Text style={[styles.tabText, selectedTab === 'upcoming' && styles.activeTabText]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'completed' && styles.activeTab]}
          onPress={() => setSelectedTab('completed')}
        >
          <Text style={[styles.tabText, selectedTab === 'completed' && styles.activeTabText]}>
            Completed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
          onPress={() => setSelectedTab('all')}
        >
          <Text style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}>
            All
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredSessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SessionCard session={item} />}
        scrollEnabled={true}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>No sessions found</Text>
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
    paddingTop: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#4f46e5',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#ffffff',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sessionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4f46e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  sessionMeta: {
    fontSize: 13,
    color: '#6b7280',
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionBody: {
    marginBottom: 12,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  durationText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 6,
  },
  notes: {
    fontSize: 13,
    color: '#4b5563',
    fontStyle: 'italic',
    marginTop: 8,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#e5e7eb',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  joinButton: {
    flex: 1,
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  rescheduleButton: {
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
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
