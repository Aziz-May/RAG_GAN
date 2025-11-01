import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import '../../global.css';

export default function UploadScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    school: '',
    dreamJob: '',
    additionalInfo: '',
  });
  const [loading, setLoading] = useState(false);

  const handleImagePick = () => {
    // Placeholder for image picker
    Alert.alert(
      'Upload Photo',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: () => {
            // Camera logic will go here
            Alert.alert('Info', 'Camera functionality will be integrated with expo-image-picker');
          },
        },
        {
          text: 'Gallery',
          onPress: () => {
            // Gallery logic will go here
            Alert.alert('Info', 'Gallery functionality will be integrated with expo-image-picker');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSubmit = () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please upload a photo');
      return;
    }

    if (!formData.name || !formData.school || !formData.dreamJob) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    // Simulate upload
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Information uploaded successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setSelectedImage(null);
            setFormData({
              name: '',
              school: '',
              dreamJob: '',
              additionalInfo: '',
            });
          },
        },
      ]);
    }, 1500);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 pt-16 pb-8 px-6">
        <Text className="text-3xl font-bold text-white">Upload Information</Text>
        <Text className="text-base text-blue-100 mt-2">
          Share your photo and details with us
        </Text>
      </View>

      <View className="px-6 py-6">
        {/* Image Upload Card */}
        <Card className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Profile Photo</Text>
          
          <TouchableOpacity
            onPress={handleImagePick}
            className="bg-gray-100 rounded-2xl h-64 items-center justify-center border-2 border-dashed border-gray-300"
          >
            {selectedImage ? (
              <Image
                source={{ uri: selectedImage }}
                className="w-full h-full rounded-2xl"
                resizeMode="cover"
              />
            ) : (
              <View className="items-center">
                <Ionicons name="cloud-upload-outline" size={64} color="#9ca3af" />
                <Text className="text-gray-600 mt-4 text-base font-medium">
                  Tap to upload photo
                </Text>
                <Text className="text-gray-500 mt-1 text-sm">
                  Camera or Gallery
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {selectedImage && (
            <TouchableOpacity
              onPress={() => setSelectedImage(null)}
              className="mt-4 flex-row items-center justify-center"
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
              <Text className="text-red-500 ml-2 font-medium">Remove Photo</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Information Form */}
        <Card>
          <Text className="text-lg font-semibold text-gray-900 mb-4">Your Information</Text>

          <Input
            label="Full Name *"
            placeholder="Enter your full name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />

          <Input
            label="School *"
            placeholder="Enter your school name"
            value={formData.school}
            onChangeText={(text) => setFormData({ ...formData, school: text })}
          />

          <Input
            label="Dream Job *"
            placeholder="What's your dream job?"
            value={formData.dreamJob}
            onChangeText={(text) => setFormData({ ...formData, dreamJob: text })}
          />

          <Input
            label="Additional Information"
            placeholder="Tell us more about yourself..."
            value={formData.additionalInfo}
            onChangeText={(text) => setFormData({ ...formData, additionalInfo: text })}
            multiline
            numberOfLines={4}
          />

          <Button
            title="Submit Information"
            onPress={handleSubmit}
            loading={loading}
            className="mt-4"
          />
        </Card>

        {/* Info Box */}
        <View className="mt-6 mb-8 bg-blue-50 rounded-xl p-4 flex-row">
          <Ionicons name="information-circle" size={24} color="#2563eb" />
          <View className="ml-3 flex-1">
            <Text className="text-sm text-blue-900 font-medium mb-1">
              Why do we need this?
            </Text>
            <Text className="text-sm text-blue-700">
              This information helps us personalize your experience and provide better guidance
              for your career journey.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
