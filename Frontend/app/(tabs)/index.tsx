import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/ui/Card';
import httpClient from '@/services/http';
import "../../global.css";

export default function HomeScreen() {
  const [checking, setChecking] = useState(false);

  const checkBackend = async () => {
    try {
      setChecking(true);
      const res = await httpClient.get<{ status: string; service: string }>(`/`);
      if (res.success) {
        Alert.alert(
          'Backend Connected',
          `Status: ${res.data?.status}\nService: ${res.data?.service}`
        );
      } else {
        Alert.alert('Backend Error', res.error || 'Unknown error');
      }
    } catch (e: any) {
      Alert.alert('Network Error', e?.message || 'Could not reach backend');
    } finally {
      setChecking(false);
    }
  };
  return (
    <ScrollView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="pt-16 pb-12 px-6 bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 shadow-sm">
        <Text className="text-3xl font-extrabold text-dark-900 mb-1">Welcome Back</Text>
        <Text className="text-base text-dark-900/90 max-w-xl">
          Ready to continue your journey? We're here to help you take the next step.
        </Text>
      </View>

      <View className="px-6 py-6">
        {/* Quick Actions */}
  <Text className="text-xl font-bold text-gray-900 mb-4">Quick Actions</Text>
        
        <View className="flex-row flex-wrap gap-4 mb-8">
          <Link href="/(tabs)/chat" asChild>
            <TouchableOpacity className="flex-1 min-w-[45%]">
              <Card className="items-center py-6 shadow-md">
                <View className="w-16 h-16 rounded-full bg-indigo-50 items-center justify-center mb-3">
                  <Ionicons name="chatbubbles" size={32} color="#4f46e5" />
                </View>
                <Text className="text-base font-semibold text-gray-900">Chat</Text>
                <Text className="text-sm text-gray-600">AI Assistant</Text>
              </Card>
            </TouchableOpacity>
          </Link>

          {/* Dev-only: Check backend connectivity */}
          <TouchableOpacity className="flex-1 min-w-[45%]" onPress={checkBackend}>
            <Card className="items-center py-6 shadow-md">
              <View className="w-16 h-16 rounded-full bg-sky-50 items-center justify-center mb-3">
                {checking ? (
                  <ActivityIndicator color="#0ea5e9" />
                ) : (
                  <Ionicons name="cloud-done" size={32} color="#0ea5e9" />
                )}
              </View>
              <Text className="text-base font-semibold text-gray-900">Check Backend</Text>
              <Text className="text-sm text-gray-600">Ping API Root</Text>
            </Card>
          </TouchableOpacity>

          <Link href="/(tabs)/upload" asChild>
            <TouchableOpacity className="flex-1 min-w-[45%]">
              <Card className="items-center py-6 shadow-md">
                <View className="w-16 h-16 rounded-full bg-emerald-50 items-center justify-center mb-3">
                  <Ionicons name="cloud-upload" size={32} color="#10b981" />
                </View>
                <Text className="text-base font-semibold text-gray-900">Upload</Text>
                <Text className="text-sm text-gray-600">Share Info</Text>
              </Card>
            </TouchableOpacity>
          </Link>

          <Link href="/(tabs)/psychologists" asChild>
            <TouchableOpacity className="flex-1 min-w-[45%]">
              <Card className="items-center py-6 shadow-md">
                <View className="w-16 h-16 rounded-full bg-violet-50 items-center justify-center mb-3">
                  <Ionicons name="people" size={32} color="#7c3aed" />
                </View>
                <Text className="text-base font-semibold text-gray-900">Counselors</Text>
                <Text className="text-sm text-gray-600">Get Help</Text>
              </Card>
            </TouchableOpacity>
          </Link>

          <Link href="/(tabs)/profile" asChild>
            <TouchableOpacity className="flex-1 min-w-[45%]">
              <Card className="items-center py-6 shadow-md">
                <View className="w-16 h-16 rounded-full bg-amber-50 items-center justify-center mb-3">
                  <Ionicons name="person" size={32} color="#f59e0b" />
                </View>
                <Text className="text-base font-semibold text-gray-900">Profile</Text>
                <Text className="text-sm text-gray-600">Your Info</Text>
              </Card>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Recent Activity */}
        <Text className="text-xl font-bold text-gray-900 mb-4">Recent Activity</Text>
        <Card className="mb-4">
          <View className="flex-row items-center py-3">
            <View className="w-10 h-10 rounded-full bg-indigo-50 items-center justify-center mr-3">
              <Ionicons name="chatbubbles" size={20} color="#4f46e5" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900">Chat Session</Text>
              <Text className="text-sm text-gray-600">2 hours ago</Text>
            </View>
          </View>
        </Card>

        {/* Tips Card */}
        <Card className="bg-gradient-to-r from-indigo-50 to-violet-50 border-transparent">
          <View className="flex-row items-start">
            <Ionicons name="bulb" size={24} color="#4f46e5" />
            <View className="ml-3 flex-1">
              <Text className="text-base font-semibold text-gray-900 mb-1">
                Daily Tip
              </Text>
              <Text className="text-sm text-gray-700">
                Regular communication with counselors can help you stay on track with your goals.
              </Text>
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}
