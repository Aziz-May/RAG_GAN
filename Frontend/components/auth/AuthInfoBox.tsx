import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '@/utils/constants';

interface AuthInfoBoxProps {
  type: 'note' | 'warning' | 'info';
  title?: string;
  message: string;
}

/**
 * AuthInfoBox - Reusable info/warning box for auth screens
 * Used for consultant application notes, password requirements, etc.
 */
export const AuthInfoBox: React.FC<AuthInfoBoxProps> = ({ type, title, message }) => {
  const styles = {
    note: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: COLORS.info,
      text: 'text-blue-700',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: COLORS.warning,
      text: 'text-amber-700',
    },
    info: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      icon: COLORS.gray[600],
      text: 'text-gray-700',
    },
  };

  const style = styles[type];

  return (
    <View className={`${style.bg} ${style.border} p-4 rounded-lg border mb-6`}>
      <View className="flex-row">
        <MaterialIcons
          name={type === 'warning' ? 'warning' : 'info'}
          size={20}
          color={style.icon}
          style={{ marginRight: 12, marginTop: 2 }}
        />
        <View className="flex-1">
          {title && (
            <Text className={`${style.text} font-semibold mb-1`}>{title}</Text>
          )}
          <Text className={`${style.text} text-sm leading-5`}>{message}</Text>
        </View>
      </View>
    </View>
  );
};

export default AuthInfoBox;
