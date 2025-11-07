import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import '../../global.css';
import { router } from 'expo-router';
import { useAuth } from '@/hooks';
import authAPI from '@/services/api/auth';

export default function ProfileScreen() {
  const auth = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: auth.user?.name || '',
    email: auth.user?.email || '',
    school: auth.user?.school || '',
    dreamJob: (auth.user as any)?.dream_job || '',
    bio: auth.user?.bio || '',
    phone: auth.user?.phone || '',
  });

  const [editData, setEditData] = useState(profileData);

  const handleSave = async () => {
    try {
      setLoading(true);
      const patch = {
        name: editData.name,
        phone: editData.phone,
        school: editData.school,
        dream_job: editData.dreamJob,
        bio: editData.bio,
      } as any;
      const updated = await auth.updateProfile(patch);
      const mapped = {
        name: updated.name,
        email: updated.email,
        school: (updated as any).school || '',
        dreamJob: (updated as any).dream_job || '',
        bio: updated.bio || '',
        phone: updated.phone || '',
      };
      setProfileData(mapped);
      setEditData(mapped);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    // Refresh from backend to ensure latest
    const load = async () => {
      try {
        setLoading(true);
        const user = await authAPI.getProfile();
        const mapped = {
          name: user.name,
          email: user.email,
          school: (user as any).school || '',
          dreamJob: (user as any).dream_job || '',
          bio: user.bio || '',
          phone: user.phone || '',
        };
        setProfileData(mapped);
        setEditData(mapped);
      } catch (e) {
        console.warn('Failed to load profile', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  const handleImagePick = () => {
    Alert.alert('Photo Upload', 'Image picker will be integrated here');
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 pt-16 pb-24 px-6">
        <View className="flex-row justify-between items-center">
          <Text className="text-3xl font-bold text-white">Profile</Text>
          {!isEditing && (
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              className="bg-white/20 p-2 rounded-lg"
            >
              <Ionicons name="create-outline" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Profile Card */}
      <View className="px-6 -mt-16">
        <Card className="items-center py-6">
          {/* Profile Photo */}
          <TouchableOpacity
            onPress={isEditing ? handleImagePick : undefined}
            className="relative mb-4"
          >
            <View className="w-28 h-28 rounded-full bg-gray-300 items-center justify-center overflow-hidden">
              <Ionicons name="person" size={60} color="#9ca3af" />
            </View>
            {isEditing && (
              <View className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2">
                <Ionicons name="camera" size={20} color="white" />
              </View>
            )}
          </TouchableOpacity>

          {/* Profile Info */}
          {!isEditing ? (
            <View className="w-full">
              <Text className="text-2xl font-bold text-gray-900 text-center mb-1">
                {profileData.name}
              </Text>
              <Text className="text-base text-gray-600 text-center mb-6">
                {profileData.email}
              </Text>

              <View className="space-y-4">
                <InfoRow icon="school" label="School" value={profileData.school} />
                <InfoRow icon="briefcase" label="Dream Job" value={profileData.dreamJob} />
                <InfoRow icon="call" label="Phone" value={profileData.phone} />
                <InfoRow icon="information-circle" label="Bio" value={profileData.bio} />
              </View>
            </View>
          ) : (
            <View className="w-full">
              <Input
                label="Full Name"
                value={editData.name}
                onChangeText={(text) => setEditData({ ...editData, name: text })}
                placeholder="Enter your name"
              />
              <Input
                label="Email"
                value={editData.email}
                onChangeText={(text) => setEditData({ ...editData, email: text })}
                placeholder="Enter your email"
                keyboardType="email-address"
              />
              <Input
                label="School"
                value={editData.school}
                onChangeText={(text) => setEditData({ ...editData, school: text })}
                placeholder="Enter your school"
              />
              <Input
                label="Dream Job"
                value={editData.dreamJob}
                onChangeText={(text) => setEditData({ ...editData, dreamJob: text })}
                placeholder="Enter your dream job"
              />
              <Input
                label="Phone"
                value={editData.phone}
                onChangeText={(text) => setEditData({ ...editData, phone: text })}
                placeholder="Enter your phone"
                keyboardType="phone-pad"
              />
              <Input
                label="Bio"
                value={editData.bio}
                onChangeText={(text) => setEditData({ ...editData, bio: text })}
                placeholder="Tell us about yourself"
                multiline
                numberOfLines={3}
              />

              <View className="flex-row gap-3 mt-4">
                <Button
                  title="Cancel"
                  onPress={handleCancel}
                  variant="outline"
                  className="flex-1"
                />
                <Button title={loading ? 'Saving...' : 'Save'} onPress={handleSave} disabled={loading} className="flex-1" />
              </View>
            </View>
          )}
        </Card>

        {/* Additional Actions */}
        {!isEditing && (
          <View className="mt-6 mb-8">
            <Card>
              <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-100">
                <Ionicons name="settings-outline" size={24} color="#4b5563" />
                <Text className="ml-4 text-base text-gray-900 font-medium">Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-100">
                <Ionicons name="help-circle-outline" size={24} color="#4b5563" />
                <Text className="ml-4 text-base text-gray-900 font-medium">Help & Support</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center py-4" onPress={()=> router.replace('/(auth)/signup')}>
                <Ionicons name="log-out-outline" size={24} color="#ef4444" />
                <Text className="ml-4 text-base text-red-500 font-medium">Logout</Text>
              </TouchableOpacity>
            </Card>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View className="flex-row items-start py-3 border-b border-gray-100">
      <Ionicons name={icon} size={22} color="#6b7280" />
      <View className="ml-4 flex-1">
        <Text className="text-sm text-gray-600 mb-1">{label}</Text>
        <Text className="text-base text-gray-900">{value}</Text>
      </View>
    </View>
  );
}
