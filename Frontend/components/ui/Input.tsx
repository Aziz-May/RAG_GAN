import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  multiline?: boolean;
  numberOfLines?: number;
  error?: string;
  className?: string;
}

export default function Input({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  error,
  className = '',
}: InputProps) {
  // 👁️ Add visibility state
  const [visible, setVisible] = useState(false);

  return (
    <View className={`mb-4 ${className}`}>
      {label && (
        <Text className="text-gray-700 font-medium mb-2 text-base dark:text-gray-200">
          {label}
        </Text>
      )}

      {/* Container for input + eye icon */}
      <View
        className={`flex-row items-center bg-gray-100 dark:bg-gray-900 rounded-xl px-4 border 
          ${error ? 'border-red-500 border-2' : 'border-gray-200 dark:border-gray-700'}`}
      >
        <TextInput
          className={`flex-1 py-4 text-base text-gray-900 dark:text-white ${
            multiline ? 'min-h-[100px]' : ''
          }`}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          secureTextEntry={secureTextEntry && !visible}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
        />

        {/* 👁️ Eye toggle (only for password fields) */}
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setVisible(!visible)}>
            <Feather
              name={visible ? 'eye' : 'eye-off'}
              size={20}
              color={visible ? '#0a7ea4' : '#6b7280'}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
}
