import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import "../../global.css";

export default function ConsultantSignupScreen() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    licenseNumber: '',
    specialization: '',
    yearsOfExperience: '',
    biography: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    licenseNumber: '',
    specialization: '',
    yearsOfExperience: '',
    biography: '',
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      licenseNumber: '',
      specialization: '',
      yearsOfExperience: '',
      biography: '',
    };

    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
      valid = false;
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }

    if (!formData.licenseNumber) {
      newErrors.licenseNumber = 'License number is required';
      valid = false;
    }

    if (!formData.specialization) {
      newErrors.specialization = 'Specialization is required';
      valid = false;
    }

    if (!formData.yearsOfExperience) {
      newErrors.yearsOfExperience = 'Years of experience is required';
      valid = false;
    }

    if (!formData.biography) {
      newErrors.biography = 'Professional biography is required';
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
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
    if (!validateForm()) {
      router.push('/(consultant-tabs)' as any);
      return;
    }

    setLoading(true);
    // Simulate API call with license verification
    setTimeout(() => {
      setLoading(false);
      // Navigate to consultant dashboard after approval
      router.push('/(consultant-auth)/pending-approval' as any);
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
        <View className="flex-1 px-6 pt-16 pb-8">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-4xl font-bold text-gray-900 mb-2">
              Join as a Consultant
            </Text>
            <Text className="text-lg text-gray-600">
              Create your professional account
            </Text>
          </View>

          {/* Form */}
          <View className="mb-6">
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChangeText={(value) => updateField('fullName', value)}
              error={errors.fullName}
            />

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
              label="Specialization"
              placeholder="e.g., Career Counseling, Educational Psychology"
              value={formData.specialization}
              onChangeText={(value) => updateField('specialization', value)}
              error={errors.specialization}
            />

            <Input
              label="Years of Experience"
              placeholder="Enter years of professional experience"
              value={formData.yearsOfExperience}
              onChangeText={(value) => updateField('yearsOfExperience', value)}
              keyboardType="numeric"
              error={errors.yearsOfExperience}
            />

            <Input
              label="Professional Biography"
              placeholder="Brief description of your background and expertise"
              value={formData.biography}
              onChangeText={(value) => updateField('biography', value)}
              multiline
              numberOfLines={4}
              error={errors.biography}
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

            <View className="bg-indigo-50 p-4 rounded-lg mb-6">
              <Text className="text-sm text-indigo-700">
                Note: Your application will be reviewed for verification. You'll be notified once your account is approved.
              </Text>
            </View>

            <Button
              title="Submit Application"
              onPress={handleSignup}
              loading={loading}
              className="mb-4 mt-2"
            />
          </View>

          {/* Sign In Link */}
          <View className="flex-row justify-center items-center">
            <Text className="text-gray-600 text-base">
              Already have an account?{" "}
            </Text>
            <Link href={"/(consultant-auth)/login" as any} asChild>
              <TouchableOpacity>
                <Text className="text-indigo-600 font-semibold text-base">
                  Sign In
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}