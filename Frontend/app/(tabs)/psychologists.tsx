import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import '../../global.css';
import { useRouter } from 'expo-router';
import { consultantAPI, ConsultantListItem } from '@/services/api/consultant';

interface Psychologist {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  available: boolean;
  bio: string;
}

// Fallback card type for legacy UI
const psychologists: Psychologist[] = [];

export default function PsychologistsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consultants, setConsultants] = useState<ConsultantListItem[]>([]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await consultantAPI.listBasic();
      setConsultants(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load consultants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleMessage = (c: { id: string; name: string }) => {
    // Navigate to conversation screen with real backend user id
    router.push({ pathname: '/messages/[clientName]', params: { clientName: c.name, otherUserId: c.id } });
  };

  const handleConsultation = (psychologist: Psychologist) => {
    if (!psychologist.available) {
      Alert.alert('Unavailable', `${psychologist.name} is currently unavailable.`);
      return;
    }

    Alert.alert(
      'Request Consultation',
      `Request consultation with ${psychologist.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request',
          onPress: () => Alert.alert('Success', 'Consultation request sent!'),
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-blue-600 pt-16 pb-8 px-6">
        <Text className="text-3xl font-bold text-white">Psychologists</Text>
        <Text className="text-base text-blue-100 mt-2">
          Connect with professional counselors
        </Text>
      </View>

      <View className="px-6 py-6">
        {loading ? (
          <View className="py-6 items-center">
            <ActivityIndicator color="#2563eb" />
          </View>
        ) : error ? (
          <Text className="text-red-500">{error}</Text>
        ) : consultants.length === 0 ? (
          <Text className="text-gray-500">No consultants found. Try signing up a consultant account.</Text>
        ) : (
          consultants.map((c) => (
            <Card className="mb-4" key={c.id}>
              <View className="flex-row items-start mb-4">
                <View className="w-16 h-16 rounded-full bg-blue-100 items-center justify-center mr-4">
                  <Ionicons name="person" size={32} color="#2563eb" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-lg font-bold text-gray-900">{c.name}</Text>
                    <View className="bg-green-100 px-2 py-1 rounded-full">
                      <Text className="text-xs text-green-700 font-medium">Consultant</Text>
                    </View>
                  </View>
                  {c.bio ? (
                    <Text className="text-sm text-gray-700" numberOfLines={2}>{c.bio}</Text>
                  ) : (
                    <Text className="text-sm text-gray-500">No bio provided</Text>
                  )}
                </View>
              </View>

              <View className="flex-row gap-3">
                <Button title="Message" onPress={() => handleMessage({ id: c.id, name: c.name })} variant="outline" className="flex-1" />
                <Button title="Consultation" onPress={() => handleConsultation({ id: c.id, name: c.name, specialty: '', experience: '', rating: 0, available: true, bio: c.bio || '' })} className="flex-1" />
              </View>
            </Card>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function PsychologistCard({
  psychologist,
  onMessage,
  onConsultation,
}: {
  psychologist: Psychologist;
  onMessage: (p: Psychologist) => void;
  onConsultation: (p: Psychologist) => void;
}) {
  return (
    <Card className="mb-4">
      <View className="flex-row items-start mb-4">
        <View className="w-16 h-16 rounded-full bg-blue-100 items-center justify-center mr-4">
          <Ionicons name="person" size={32} color="#2563eb" />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-lg font-bold text-gray-900">{psychologist.name}</Text>
            {psychologist.available && (
              <View className="bg-green-100 px-2 py-1 rounded-full">
                <Text className="text-xs text-green-700 font-medium">Available</Text>
              </View>
            )}
          </View>
          <Text className="text-sm text-blue-600 font-medium mb-1">
            {psychologist.specialty}
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="star" size={14} color="#fbbf24" />
            <Text className="text-sm text-gray-600 ml-1">
              {psychologist.rating} • {psychologist.experience}
            </Text>
          </View>
        </View>
      </View>

      <Text className="text-sm text-gray-700 mb-4">{psychologist.bio}</Text>

      <View className="flex-row gap-3">
        <Button
          title="Message"
          onPress={() => onMessage(psychologist)}
          variant="outline"
          className="flex-1"
        />
        <Button
          title="Consultation"
          onPress={() => onConsultation(psychologist)}
          className="flex-1"
          disabled={!psychologist.available}
        />
      </View>
    </Card>
  );
}
