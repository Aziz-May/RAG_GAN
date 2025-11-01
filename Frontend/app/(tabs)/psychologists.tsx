import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import '../../global.css';

interface Psychologist {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  available: boolean;
  bio: string;
}

const psychologists: Psychologist[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Career Counseling',
    experience: '10+ years',
    rating: 4.9,
    available: true,
    bio: 'Specialized in helping students discover their career paths.',
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: 'Educational Psychology',
    experience: '8+ years',
    rating: 4.8,
    available: true,
    bio: 'Expert in student development and academic performance.',
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Youth Counseling',
    experience: '12+ years',
    rating: 4.9,
    available: false,
    bio: 'Supporting young people through their educational journey.',
  },
];

export default function PsychologistsScreen() {
  const handleMessage = (psychologist: Psychologist) => {
    Alert.alert(
      'Send Message',
      `Send a message to ${psychologist.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => Alert.alert('Success', 'Message sent!'),
        },
      ]
    );
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
        {psychologists.map((psychologist) => (
          <PsychologistCard
            key={psychologist.id}
            psychologist={psychologist}
            onMessage={handleMessage}
            onConsultation={handleConsultation}
          />
        ))}
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
