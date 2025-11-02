import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from '@/utils/constants';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  fullScreen?: boolean;
}

/**
 * LoadingSpinner - Reusable loading indicator component
 * 
 * @example
 * <LoadingSpinner size="large" />
 * <LoadingSpinner fullScreen color={COLORS.primary} />
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = COLORS.primary,
  fullScreen = false,
}) => {
  if (fullScreen) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size={size} color={color} />
      </View>
    );
  }

  return (
    <View className="justify-center items-center py-8">
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

export default LoadingSpinner;
