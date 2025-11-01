import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import "../../global.css";

export default function ConsultantLoginScreen() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    licenseNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    licenseNumber: '',
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      email: '',
      password: '',
      licenseNumber: '',
    };

    if (!formData.email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      valid = false;
    }

    if (!formData.licenseNumber) {
      newErrors.licenseNumber = 'License number is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    // Simulate API call with license verification
    setTimeout(() => {
      setLoading(false);
      // Navigate to consultant dashboard
      router.replace('/(consultant-tabs)' as any);
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-50"
    >
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-20 pb-8">
          {/* Header */}
          <View className="mb-12">
            <Text className="text-4xl font-bold text-gray-900 mb-2">
              Welcome Back, Professional
            </Text>
            <Text className="text-lg text-gray-600">
              Sign in to your consultant portal
            </Text>
          </View>

          {/* Form */}
          <View className="mb-6">
            <Input
              label="Professional Email"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              keyboardType="email-address"
              error={errors.email}
            />

            <Input
              label="License Number"
              placeholder="Enter your professional license number"
              value={formData.licenseNumber}
              onChangeText={(value) => updateField('licenseNumber', value)}
              error={errors.licenseNumber}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={(value) => updateField('password', value)}
              secureTextEntry
              error={errors.password}
            />

            <TouchableOpacity className="self-end mb-6">
              <Text className="text-indigo-600 font-medium">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <Button
              title="Sign In as Consultant"
              onPress={handleLogin}
              loading={loading}
              className="mb-4"
            />

            {/* Switch to Client Login */}
            <TouchableOpacity 
              onPress={() => router.replace('/(auth)/login')}
              className="mb-6"
            >
              <Text className="text-center text-gray-600">
                Not a consultant? <Text className="text-indigo-600 font-medium">Sign in as Client</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-gray-500">or</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Sign Up Link */}
          <View className="flex-row justify-center items-center">
            <Text className="text-gray-600 text-base">
              Don't have a consultant account?{" "}
            </Text>
            <Link href={"/(consultant-auth)/signup" as any} asChild>
              <TouchableOpacity>
                <Text className="text-indigo-600 font-semibold text-base">
                  Apply Now
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}