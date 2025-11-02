import React from 'react';
import { StatusBar } from 'expo-status-bar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { AuthFormLayout, AuthHeader, AuthFooter } from '@/components/auth';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from '@/hooks/useForm';
import { validateEmail, validatePassword } from '@/utils/validation';
import { router } from 'expo-router';
import { ROUTES } from '@/utils/constants';
import '../../global.css';

interface LoginValues {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const auth = useAuth();

  // Form validation schema
  const validateLoginForm = (values: LoginValues) => {
    const errors: Record<string, string> = {};
    const emailError = validateEmail(values.email);
    if (emailError) errors.email = emailError;
    const passwordError = validatePassword(values.password);
    if (passwordError) errors.password = passwordError;
    return errors;
  };

  // Initialize form with useForm hook
  const form = useForm<LoginValues>(
    { email: '', password: '' },
    async (values) => {
      try {
        await auth.login(values.email, values.password);
        // Navigate to client tabs after successful login
  router.replace('/(tabs)');
      } catch (error) {
        // Error is already handled by AuthContext
        console.error('Login error:', error);
      }
    },
    validateLoginForm
  );

  return (
    <>
      <StatusBar style="dark" />
      <AuthFormLayout>
        <AuthHeader
          title="Welcome Back"
          subtitle="Sign in to continue your journey"
          variant="client"
        />

        {/* Error Alert */}
        {auth.error && (
          <Alert
            type="error"
            title="Login Failed"
            message={auth.error}
            dismissible
            onDismiss={() => auth.clearError()}
          />
        )}

        {/* Form Fields */}
        <Input
          label="Email"
          placeholder="Enter your email"
          value={form.values.email}
          onChangeText={form.handleChange('email')}
          onBlur={form.handleBlur('email')}
          keyboardType="email-address"
          error={form.touched.email ? form.errors.email : undefined}
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          value={form.values.password}
          onChangeText={form.handleChange('password')}
          onBlur={form.handleBlur('password')}
          secureTextEntry
          error={form.touched.password ? form.errors.password : undefined}
        />

        <Button
          title={auth.isLoading ? 'Signing in...' : 'Sign In'}
          onPress={form.handleSubmit}
          loading={auth.isLoading || form.isSubmitting}
          disabled={auth.isLoading || form.isSubmitting}
          className="mt-6"
        />

        <AuthFooter variant="login" userType="client" />
      </AuthFormLayout>
    </>
  );
}
