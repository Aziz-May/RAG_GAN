import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import '../../global.css';
import * as ImagePicker from 'expo-image-picker';
// Using new expo-file-system base import plus legacy API for writeAsStringAsync (deprecated notice)
import * as FileSystem from 'expo-file-system';
// Temporary: import legacy API to avoid deprecation warning while migrating to new File/Directory classes
// See https://docs.expo.dev/versions/latest/sdk/filesystem/ for migration path
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as LegacyFileSystem from 'expo-file-system/legacy';
import { generateCareerImage } from '@/services/api/upload';

export default function UploadScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    school: '',
    dreamJob: '',
    additionalInfo: '',
  });
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleImagePick = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('Permission required', 'We need access to your photos to select an image.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.9,
      });
      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (asset?.uri) {
        setSelectedImage(asset.uri);
        setGeneratedImage(null);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to pick image');
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please upload a photo');
      return;
    }

    if (!formData.name || !formData.school || !formData.dreamJob) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const dataUri = await generateCareerImage({
        uri: selectedImage,
        filename: 'photo.jpg',
        mimeType: 'image/jpeg',
        name: formData.name,
        dreamJob: formData.dreamJob,
      });
      setGeneratedImage(dataUri);
      Alert.alert('Success', 'Image generated!');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  // Result view: show only generated image full screen with back & download actions
  if (generatedImage) {
    const handleBack = () => {
      setGeneratedImage(null);
    };

    const handleDownload = async () => {
      try {
        // Extract base64 data
        const match = generatedImage.match(/base64,(.*)$/);
        const base64Data = match ? match[1] : null;
        if (!base64Data) {
          Alert.alert('Error', 'Invalid image data');
          return;
        }
  const fileName = `career_${Date.now()}.png`;

        if (Platform.OS === 'web') {
          // Create a temporary download link
            const link = document.createElement('a');
            link.href = generatedImage;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            Alert.alert('Saved', 'Image downloaded.');
            return;
        }

        // Native: write and save to gallery
        const baseDir = (FileSystem as any).cacheDirectory || (FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory;
        const fileUri = baseDir + fileName;
  // Use legacy writeAsStringAsync until refactored to new File API
  await (LegacyFileSystem as any).writeAsStringAsync(fileUri, base64Data, { encoding: (LegacyFileSystem as any).EncodingType?.Base64 });

        // Dynamically require to avoid TS/type issues in web
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const MediaLibrary = require('expo-media-library');
        const perm = await MediaLibrary.requestPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Permission needed', 'Enable media library permission to save the image.');
          return;
        }
        const asset = await MediaLibrary.createAssetAsync(fileUri);
        await MediaLibrary.createAlbumAsync('Tutore AI Images', asset, false);
        Alert.alert('Saved', 'Image saved to gallery (Tutore AI Images).');
      } catch (e: any) {
        Alert.alert('Error', e.message || 'Failed to download image');
      }
    };

    return (
      <View className="flex-1 bg-black">
        {/* Top bar */}
        <View className="flex-row items-center justify-between px-4 pt-14 pb-4 bg-black/70">
          <TouchableOpacity onPress={handleBack} className="flex-row items-center">
            <Ionicons name="arrow-back" size={24} color="white" />
            <Text className="text-white ml-2 font-medium">Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDownload} className="flex-row items-center">
            <Ionicons name="download" size={22} color="#3b82f6" />
            <Text className="text-blue-400 ml-1 font-semibold">Download</Text>
          </TouchableOpacity>
        </View>
        {/* Image */}
        <View className="flex-1 items-center justify-center px-4">
          <Image
            source={{ uri: generatedImage }}
            className="w-full h-full rounded-xl"
            resizeMode="contain"
          />
        </View>
      </View>
    );
  }

  // Form view
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
            title="Generate Career Image"
            onPress={handleSubmit}
            loading={loading}
            className="mt-4"
          />
        </Card>

        {/* Info Box */}
        <View className="mt-6 mb-8 bg-red-50 rounded-xl p-4 flex-row">
          <Ionicons name="warning" size={24} color="red" />
          <View className="ml-3 flex-1">
            <Text className="text-sm text-red-900 font-medium mb-1">
              Privacy Note 
            </Text>
            <Text className="text-sm text-red-700">
              The photo will never be stored. It will be generated and shown once; you can download it immediately.
              After you leave this page or go back, you’ll need to regenerate.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
