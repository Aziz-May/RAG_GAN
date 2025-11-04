import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { RoleSelector, AuthFormLayout, AuthHeader, AuthFooter } from '@/components/auth';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from '@/hooks/useForm';
import { validateEmail, validatePassword, validateName } from '@/utils/validation';
import { navigateToSignup } from '@/services/navigation';
import { router } from 'expo-router';
import { ROUTES } from '@/utils/constants';
import '../../global.css';

interface SignupValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

export default function SignupScreen() {
  const [role, setRole] = useState<'client' | 'consultant'>('client');
  const auth = useAuth();
  
  // Reset form when switching roles for a cleaner UX
  useEffect(() => {
    // Only reset when toggling role on this screen
    // (If role === 'consultant', we still stay on this screen until submit)
    form.resetForm();
  }, [role]);

  // Form validation schema
  const validateSignupForm = (values: SignupValues) => {
    const errors: Record<string, string> = {};

    const nameError = validateName(values.name);
    if (nameError) errors.name = nameError;

    const emailError = validateEmail(values.email);
    if (emailError) errors.email = emailError;

    const passwordError = validatePassword(values.password);
    if (passwordError) errors.password = passwordError;

    if (values.password !== values.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  };

  // Initialize form
  const form = useForm<SignupValues>(
    { name: '', email: '', password: '', confirmPassword: '', phone: '' },
    async (values) => {
      try {
        // If consultant role selected, go to consultant signup
        if (role === 'consultant') {
          navigateToSignup('consultant');
          return;
        }

        // Sign up as client
        await auth.signup({
          name: values.name,
          email: values.email,
          password: values.password,
          role: 'client',
          phone: values.phone,
        });
        // Navigate to client tabs after signup
  router.replace('/(tabs)');
      } catch (error) {
        // Error is already handled by AuthContext
        console.error('Signup error:', error);
      }
    },
    validateSignupForm
  );

  return (
    <>
      <StatusBar style="dark" />
      <AuthFormLayout>
        <AuthHeader
          title="Create Account"
          subtitle="Join us on your journey"
          variant="client"
        />

        {/* Error Alert */}
        {auth.error && (
          <Alert
            type="error"
            title="Signup Failed"
            message={auth.error}
            dismissible
            onDismiss={() => auth.clearError()}
          />
        )}

        {/* Role Selector */}
        <RoleSelector role={role} onRoleChange={setRole} consultantNote />

        {/* Form Fields */}
        <Input
          label="Full Name"
          placeholder="Enter your full name"
          value={form.values.name}
          onChangeText={form.handleChange('name')}
          onBlur={form.handleBlur('name')}
          error={form.touched.name ? form.errors.name : undefined}
        />

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
          label="Phone Number"
          placeholder="Enter your phone number"
          value={form.values.phone}
          onChangeText={form.handleChange('phone')}
          onBlur={form.handleBlur('phone')}
          keyboardType="phone-pad"
          error={form.touched.phone ? form.errors.phone : undefined}
        />

        <Input
          label="Password"
          placeholder="Create a password"
          value={form.values.password}
          onChangeText={form.handleChange('password')}
          onBlur={form.handleBlur('password')}
          secureTextEntry
          error={form.touched.password ? form.errors.password : undefined}
        />

        <Input
          label="Confirm Password"
          placeholder="Confirm your password"
          value={form.values.confirmPassword}
          onChangeText={form.handleChange('confirmPassword')}
          onBlur={form.handleBlur('confirmPassword')}
          secureTextEntry
          error={form.touched.confirmPassword ? form.errors.confirmPassword : undefined}
        />

        {/* Submit Button */}
        <Button
          title={role === 'consultant' ? 'Apply as Consultant' : 'Sign Up'}
          onPress={form.handleSubmit}
          loading={auth.isLoading || form.isSubmitting}
          disabled={auth.isLoading || form.isSubmitting}
          className="mt-6"
        />

        {/* Footer */}
        <AuthFooter variant="signup" userType="client" />
      </AuthFormLayout>
    </>
  );
}
