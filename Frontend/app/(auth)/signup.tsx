import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import '../../global.css';

export default function SignupScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    school: '',
    dreamJob: '',
    password: '',
    confirmPassword: '',
  });
  const [role, setRole] = useState<'client' | 'consultant'>('client');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    school: '',
    dreamJob: '',
    password: '',
    confirmPassword: '',
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      name: '',
      email: '',
      school: '',
      dreamJob: '',
      password: '',
      confirmPassword: '',
    };

    if (!formData.name) {
      newErrors.name = 'Name is required';
      valid = false;
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }

    if (!formData.school) {
      newErrors.school = 'School is required';
      valid = false;
    }

    if (!formData.dreamJob) {
      newErrors.dreamJob = 'Dream job is required';
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    // If user selected consultant, forward them to the consultant application flow
    if (role === 'consultant') {
      // optional: we could pass basic info via query params or state; keep simple for now
      router.push('/(consultant-auth)/signup' as any);
      return;
    }

    setLoading(true);
    // Simulate API call for client signup
    setTimeout(() => {
      setLoading(false);
      // Navigate to main app (tabs)
      router.replace('/(tabs)');
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-16 pb-8">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-4xl font-bold text-gray-900 mb-2">Create Account</Text>
            <Text className="text-lg text-gray-600">Join us on your journey</Text>
          </View>

          {/* Form */}
          {/* Role selector */}
          <View className="mb-4">
            <Text className="text-sm text-gray-700 mb-2">I am signing up as</Text>
            <View className="flex-row rounded-lg overflow-hidden border border-gray-200">
              <TouchableOpacity
                onPress={() => setRole('client')}
                className={`flex-1 px-4 py-2 items-center ${role === 'client' ? 'bg-white' : 'bg-gray-50'}`}
              >
                <Text className={`font-medium ${role === 'client' ? 'text-gray-900' : 'text-gray-600'}`}>Client</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setRole('consultant')}
                className={`flex-1 px-4 py-2 items-center ${role === 'consultant' ? 'bg-white' : 'bg-gray-50'}`}
              >
                <Text className={`font-medium ${role === 'consultant' ? 'text-gray-900' : 'text-gray-600'}`}>Consultant</Text>
              </TouchableOpacity>
            </View>
            {role === 'consultant' && (
              <Text className="text-xs text-gray-500 mt-2">Consultants apply to create a professional account; your application will be reviewed.</Text>
            )}
          </View>

          <View className="mb-6">
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              error={errors.name}
            />

            <Input
              label="Email"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              keyboardType="email-address"
              error={errors.email}
            />

            <Input
              label="School"
              placeholder="Enter your school name"
              value={formData.school}
              onChangeText={(value) => updateField('school', value)}
              error={errors.school}
            />

            <Input
              label="Dream Job"
              placeholder="What's your dream job?"
              value={formData.dreamJob}
              onChangeText={(value) => updateField('dreamJob', value)}
              error={errors.dreamJob}
            />

            <Input
              label="Password"
              placeholder="Create a password"
              value={formData.password}
              onChangeText={(value) => updateField('password', value)}
              secureTextEntry
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChangeText={(value) => updateField('confirmPassword', value)}
              secureTextEntry
              error={errors.confirmPassword}
            />

            <Button
              title={role === 'consultant' ? 'Apply as Consultant' : 'Sign Up'}
              onPress={handleSignup}
              loading={loading}
              className="mb-4 mt-2"
            />
          </View>

          {/* Sign In Link */}
          <View className="flex-row justify-center items-center">
            <Text className="text-gray-600 text-base">Already have an account? </Text>
            <Link href={"/(auth)/login" as any} asChild>
              <TouchableOpacity>
                <Text className="text-blue-600 font-semibold text-base">Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
