import React from 'react';
import { View, Text, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '@/utils/constants';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  image?: string;
}

/**
 * EmptyState - Reusable empty state component for no data scenarios
 * 
 * @example
 * <EmptyState
 *   icon="inbox"
 *   title="No messages"
 *   description="You don't have any messages yet"
 *   actionText="Start a conversation"
 *   onAction={() => navigateTo('/messages')}
 * />
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  description,
  actionText,
  onAction,
  image,
}) => {
  return (
    <View className="flex-1 justify-center items-center px-6 py-12">
      {image ? (
        <Image source={{ uri: image }} className="w-24 h-24 mb-6" resizeMode="contain" />
      ) : (
        <MaterialIcons name={icon as any} size={60} color={COLORS.gray[300]} className="mb-6" />
      )}

      <Text className="text-2xl font-bold text-gray-900 text-center mb-2">{title}</Text>

      {description && (
        <Text className="text-base text-gray-600 text-center mb-6">{description}</Text>
      )}

      {actionText && onAction && (
        <View
          style={{ backgroundColor: COLORS.primary }}
          className="px-6 py-3 rounded-lg"
        >
          <Text
            className="text-white font-semibold"
            onPress={onAction}
          >
            {actionText}
          </Text>
        </View>
      )}
    </View>
  );
};

export default EmptyState;
