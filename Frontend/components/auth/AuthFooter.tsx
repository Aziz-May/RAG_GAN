import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { COLORS } from '@/utils/constants';

interface AuthFooterProps {
  variant: 'login' | 'signup';
  userType: 'client' | 'consultant';
  onSwitchRole?: () => void;
}

/**
 * AuthFooter - Consistent footer for auth screens
 * Handles navigation and role switching
 */
export const AuthFooter: React.FC<AuthFooterProps> = ({
  variant,
  userType,
  onSwitchRole,
}) => {
  const isClient = userType === 'client';

  if (variant === 'login') {
    return (
      <View className="mt-8">
        {/* Divider */}
        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="mx-4 text-gray-500">or</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        {/* Sign Up Link */}
        <View className="flex-row justify-center items-center mb-4">
          <Text className="text-gray-600 text-base">Don't have an account? </Text>
          <Link
            href={isClient ? '/(auth)/signup' : '/(consultant-auth)/signup'}
            asChild
          >
            <TouchableOpacity>
              <Text
                className="font-semibold text-base"
                style={{ color: isClient ? COLORS.primary : COLORS.secondary }}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Switch Role Link */}
        {!isClient && (
          <View className="flex-row justify-center items-center">
            <Text className="text-gray-600 text-base">Client looking for help? </Text>
            <TouchableOpacity onPress={onSwitchRole}>
              <Text className="font-semibold text-base" style={{ color: COLORS.primary }}>
                Sign in here
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <View className="mt-8 flex-row justify-center items-center">
      <Text className="text-gray-600 text-base">Already have an account? </Text>
      <Link href={isClient ? '/(auth)/login' : '/(consultant-auth)/login'} asChild>
        <TouchableOpacity>
          <Text
            className="font-semibold text-base"
            style={{ color: isClient ? COLORS.primary : COLORS.secondary }}
          >
            Sign In
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

export default AuthFooter;
