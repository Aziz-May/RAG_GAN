import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '@/utils/constants';

interface RoleSelectorProps {
  role: 'client' | 'consultant';
  onRoleChange: (role: 'client' | 'consultant') => void;
  consultantNote?: boolean;
}

/**
 * RoleSelector - Reusable component for switching between client and consultant
 * Used in signup flows
 */
export const RoleSelector: React.FC<RoleSelectorProps> = ({
  role,
  onRoleChange,
  consultantNote = false,
}) => {
  return (
    <View className="mb-6">
      <Text className="text-sm font-medium text-gray-700 mb-3">I am signing up as</Text>
      <View className="flex-row rounded-lg overflow-hidden border border-gray-200">
        <TouchableOpacity
          onPress={() => onRoleChange('client')}
          className={`flex-1 px-4 py-3 items-center transition-colors ${
            role === 'client' ? 'bg-white' : 'bg-gray-50'
          }`}
          style={{
            borderRightWidth: 1,
            borderRightColor: '#e5e7eb',
          }}
        >
          <Text
            className={`font-semibold text-base ${
              role === 'client' ? 'text-gray-900' : 'text-gray-600'
            }`}
          >
            Client
          </Text>
          <Text className="text-xs text-gray-500 mt-1">Seeking guidance</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onRoleChange('consultant')}
          className={`flex-1 px-4 py-3 items-center transition-colors ${
            role === 'consultant' ? 'bg-white' : 'bg-gray-50'
          }`}
        >
          <Text
            className={`font-semibold text-base ${
              role === 'consultant' ? 'text-gray-900' : 'text-gray-600'
            }`}
          >
            Consultant
          </Text>
          <Text className="text-xs text-gray-500 mt-1">Providing services</Text>
        </TouchableOpacity>
      </View>

      {role === 'consultant' && consultantNote && (
        <View className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <Text className="text-xs text-blue-700">
            ℹ️ Consultants apply through a verification process. Your application will be reviewed.
          </Text>
        </View>
      )}
    </View>
  );
};

export default RoleSelector;
