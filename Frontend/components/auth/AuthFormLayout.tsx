import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';

interface AuthFormLayoutProps {
  children: React.ReactNode;
}

/**
 * AuthFormLayout - Consistent wrapper for all auth screens
 * Handles keyboard behavior, scrolling, and layout consistency
 */
export const AuthFormLayout: React.FC<AuthFormLayoutProps> = ({ children }) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 py-8">{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AuthFormLayout;
