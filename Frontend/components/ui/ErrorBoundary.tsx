import React, { useState } from 'react';
import { View, Text, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '@/utils/constants';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary - React error boundary component for catching errors
 * Wraps child components and displays error UI if something breaks
 * 
 * @example
 * <ErrorBoundary onError={(err) => console.error(err)}>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <View className="flex-1 justify-center items-center bg-white px-6">
            <MaterialIcons name="error-outline" size={60} color={COLORS.error} className="mb-4" />
            <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
              Something went wrong
            </Text>
            <Text className="text-base text-gray-600 text-center mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>
            <View
              style={{ backgroundColor: COLORS.primary }}
              className="px-6 py-3 rounded-lg"
            >
              <Text
                className="text-white font-semibold"
                onPress={this.reset}
              >
                Try Again
              </Text>
            </View>
          </View>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
