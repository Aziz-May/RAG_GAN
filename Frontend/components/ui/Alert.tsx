import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '@/utils/constants';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const alertColors = {
  success: { bg: '#ecfdf5', border: '#a7f3d0', text: '#047857', icon: COLORS.success },
  error: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', icon: COLORS.error },
  warning: { bg: '#fffbeb', border: '#fde68a', text: '#92400e', icon: COLORS.warning },
  info: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', icon: COLORS.info },
};

const alertIcons = {
  success: 'check-circle',
  error: 'error',
  warning: 'warning',
  info: 'info',
};

/**
 * Alert - Reusable alert component for inline messages
 * 
 * @example
 * <Alert
 *   type="success"
 *   title="Success"
 *   message="Your profile has been updated"
 *   dismissible
 * />
 */
export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  dismissible = false,
  onDismiss,
}) => {
  const colors = alertColors[type];
  const icon = alertIcons[type];

  return (
    <View
      style={{ backgroundColor: colors.bg, borderColor: colors.border }}
      className="flex-row items-start p-4 border border-l-4 rounded-lg mb-4"
    >
      <MaterialIcons name={icon as any} size={20} color={colors.icon} className="mt-0.5 mr-3" />

      <View className="flex-1">
        <Text style={{ color: colors.text }} className="font-semibold mb-1">
          {title}
        </Text>
        {message && (
          <Text style={{ color: colors.text }} className="text-sm opacity-90">
            {message}
          </Text>
        )}
      </View>

      {dismissible && (
        <MaterialIcons
          name="close"
          size={20}
          color={colors.text}
          onPress={onDismiss}
          className="ml-2"
        />
      )}
    </View>
  );
};

export default Alert;
