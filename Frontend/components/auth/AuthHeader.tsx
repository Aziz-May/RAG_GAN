import React from 'react';
import { View, Text } from 'react-native';

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  variant?: 'client' | 'consultant';
}

/**
 * AuthHeader - Consistent header for all auth screens
 * Different styling for client vs consultant flows
 */
export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  subtitle,
  variant = 'client',
}) => {
  const isConsultant = variant === 'consultant';

  return (
    <View className="mb-8">
      <Text
        className={`text-4xl font-bold mb-2 ${
          isConsultant ? 'text-gray-900' : 'text-gray-900'
        }`}
      >
        {title}
      </Text>
      {subtitle && (
        <Text className={`text-lg ${isConsultant ? 'text-gray-600' : 'text-gray-600'}`}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

export default AuthHeader;
