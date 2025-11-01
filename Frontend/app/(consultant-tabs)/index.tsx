import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/ui/Card';
import "../../global.css";

export default function ConsultantDashboard() {
  const upcomingSessions = [
    {
      id: '1',
      studentName: 'Alex Johnson',
      time: '2:30 PM',
      date: 'Today',
      type: 'Career Guidance',
    },
    {
      id: '2',
      studentName: 'Sarah Smith',
      time: '4:00 PM',
      date: 'Today',
      type: 'Academic Planning',
    },
  ];

  const stats = [
    {
      label: 'Total Sessions',
      value: '24',
      icon: 'calendar',
      color: '#4f46e5',
      bgColor: 'bg-indigo-50',
    },
    {
      label: 'Active Students',
      value: '12',
      icon: 'people',
      color: '#7c3aed',
      bgColor: 'bg-violet-50',
    },
    {
      label: 'Pending Messages',
      value: '5',
      icon: 'chatbubbles',
      color: '#10b981',
      bgColor: 'bg-emerald-50',
    },
  ];

  return (
    <ScrollView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="pt-16 pb-8 px-6 bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500">
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-2xl font-bold text-white mb-1">
              Welcome Back, Dr. Smith
            </Text>
            <Text className="text-base text-indigo-100/90">
              Your dashboard overview
            </Text>
          </View>
          <TouchableOpacity className="bg-white/20 p-2 rounded-lg">
            <Ionicons name="notifications" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View className="flex-row gap-4 -mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="flex-1 py-4 shadow-sm">
              <View className="items-center">
                <View className={`w-10 h-10 rounded-full ${stat.bgColor} items-center justify-center mb-2`}>
                  <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                </View>
                <Text className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </Text>
                <Text className="text-xs text-gray-600">{stat.label}</Text>
              </View>
            </Card>
          ))}
        </View>
      </View>

      <View className="px-6 pt-12">
        {/* Upcoming Sessions */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Today's Sessions
          </Text>
          {upcomingSessions.map((session) => (
            <Card key={session.id} className="mb-4 shadow-sm">
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-full bg-indigo-50 items-center justify-center mr-4">
                  <Text className="text-lg font-bold text-indigo-600">
                    {session.studentName.charAt(0)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    {session.studentName}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {session.type} • {session.time}
                  </Text>
                </View>
                <TouchableOpacity 
                  className="bg-indigo-100 rounded-lg p-2"
                  onPress={() => {/* Handle join session */}}
                >
                  <Ionicons name="videocam" size={20} color="#4f46e5" />
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Quick Actions
          </Text>
          <View className="flex-row flex-wrap gap-4">
            <TouchableOpacity className="flex-1">
              <Card className="items-center py-4 bg-gradient-to-br from-indigo-50 to-violet-50 border-transparent">
                <View className="w-12 h-12 rounded-full bg-white items-center justify-center mb-2">
                  <Ionicons name="calendar" size={24} color="#4f46e5" />
                </View>
                <Text className="text-sm font-medium text-gray-900">
                  Schedule Session
                </Text>
              </Card>
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-1">
              <Card className="items-center py-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-transparent">
                <View className="w-12 h-12 rounded-full bg-white items-center justify-center mb-2">
                  <Ionicons name="documents" size={24} color="#10b981" />
                </View>
                <Text className="text-sm font-medium text-gray-900">
                  View Reports
                </Text>
              </Card>
            </TouchableOpacity>
          </View>
        </View>

        {/* Resource Updates */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Latest Resources
          </Text>
          <Card className="shadow-sm">
            <View className="border-l-4 border-indigo-500 pl-4">
              <Text className="text-base font-medium text-gray-900 mb-1">
                New Assessment Tools Available
              </Text>
              <Text className="text-sm text-gray-600">
                Updated career assessment frameworks and student progress tracking tools are now available.
              </Text>
              <TouchableOpacity className="mt-3">
                <Text className="text-indigo-600 font-medium">
                  Learn More →
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}