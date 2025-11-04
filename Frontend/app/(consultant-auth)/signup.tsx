import React from 'react';
import { StatusBar } from 'expo-status-bar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { AuthFormLayout, AuthHeader, AuthFooter, AuthInfoBox } from '@/components/auth';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from '@/hooks/useForm';
import { validateEmail, validatePassword } from '@/utils/validation';
import { navigateToLogin } from '@/services/navigation';
import { router } from 'expo-router';
import { ROUTES } from '@/utils/constants';
import '../../global.css';

interface ConsultantSignupValues {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  phone: string;
  license_number: string;
  specialization: string;
  years_of_experience: string;
  biography: string;
}

export default function ConsultantSignupScreen() {
  const auth = useAuth();

  // After signup, RootLayout will redirect based on auth state

  // Form validation schema
  const validateSignupForm = (values: ConsultantSignupValues) => {
    const errors: Record<string, string> = {};

    if (!values.full_name?.trim()) {
      errors.full_name = 'Full name is required';
    }

    const emailError = validateEmail(values.email);
    if (emailError) errors.email = emailError;

    if (!values.license_number?.trim()) {
      errors.license_number = 'License number is required';
    }

    if (!values.specialization?.trim()) {
      errors.specialization = 'Specialization is required';
    }

    if (!values.years_of_experience?.trim()) {
      errors.years_of_experience = 'Years of experience is required';
    } else if (isNaN(Number(values.years_of_experience)) || Number(values.years_of_experience) < 0) {
      errors.years_of_experience = 'Please enter a valid number';
    }

    if (!values.biography?.trim()) {
      errors.biography = 'Professional biography is required';
    }

    const passwordError = validatePassword(values.password);
    if (passwordError) errors.password = passwordError;

    if (values.password !== values.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }

    return errors;
  };

  // Initialize form
  const form = useForm<ConsultantSignupValues>(
    {
      full_name: '',
      email: '',
      password: '',
      confirm_password: '',
      phone: '',
      license_number: '',
      specialization: '',
      years_of_experience: '',
      biography: '',
    },
    async (values) => {
      try {
        await auth.signupConsultant({
          name: values.full_name,
          email: values.email,
          password: values.password,
          role: 'consultant',
          phone: values.phone,
          license_number: values.license_number,
          specialization: values.specialization,
          years_of_experience: values.years_of_experience,
          biography: values.biography,
        });
        // Navigate to consultant tabs after signup
  router.replace('/(consultant-tabs)');
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
          title="Join as a Consultant"
          subtitle="Create your professional account"
          variant="consultant"
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

        {/* Full Name */}
        <Input
          label="Full Name"
          placeholder="Enter your full name"
          value={form.values.full_name}
          onChangeText={form.handleChange('full_name')}
          onBlur={form.handleBlur('full_name')}
          error={form.touched.full_name ? form.errors.full_name : undefined}
        />

        {/* Email */}
        <Input
          label="Professional Email"
          placeholder="Enter your email"
          value={form.values.email}
          onChangeText={form.handleChange('email')}
          onBlur={form.handleBlur('email')}
          keyboardType="email-address"
          error={form.touched.email ? form.errors.email : undefined}
        />

        {/* Phone */}
        <Input
          label="Phone Number"
          placeholder="Enter your phone number"
          value={form.values.phone}
          onChangeText={form.handleChange('phone')}
          onBlur={form.handleBlur('phone')}
          keyboardType="phone-pad"
          error={form.touched.phone ? form.errors.phone : undefined}
        />

        {/* License Number */}
        <Input
          label="License Number"
          placeholder="Enter your professional license number"
          value={form.values.license_number}
          onChangeText={form.handleChange('license_number')}
          onBlur={form.handleBlur('license_number')}
          error={form.touched.license_number ? form.errors.license_number : undefined}
        />

        {/* Specialization */}
        <Input
          label="Specialization"
          placeholder="e.g., Career Counseling, Educational Psychology"
          value={form.values.specialization}
          onChangeText={form.handleChange('specialization')}
          onBlur={form.handleBlur('specialization')}
          error={form.touched.specialization ? form.errors.specialization : undefined}
        />

        {/* Years of Experience */}
        <Input
          label="Years of Experience"
          placeholder="Enter years of professional experience"
          value={form.values.years_of_experience}
          onChangeText={form.handleChange('years_of_experience')}
          onBlur={form.handleBlur('years_of_experience')}
          keyboardType="numeric"
          error={form.touched.years_of_experience ? form.errors.years_of_experience : undefined}
        />

        {/* Biography */}
        <Input
          label="Professional Biography"
          placeholder="Brief description of your background and expertise"
          value={form.values.biography}
          onChangeText={form.handleChange('biography')}
          onBlur={form.handleBlur('biography')}
          multiline
          numberOfLines={4}
          error={form.touched.biography ? form.errors.biography : undefined}
        />

        {/* Password */}
        <Input
          label="Password"
          placeholder="Create a password"
          value={form.values.password}
          onChangeText={form.handleChange('password')}
          onBlur={form.handleBlur('password')}
          secureTextEntry
          error={form.touched.password ? form.errors.password : undefined}
        />

        {/* Confirm Password */}
        <Input
          label="Confirm Password"
          placeholder="Confirm your password"
          value={form.values.confirm_password}
          onChangeText={form.handleChange('confirm_password')}
          onBlur={form.handleBlur('confirm_password')}
          secureTextEntry
          error={form.touched.confirm_password ? form.errors.confirm_password : undefined}
        />

        {/* Application Note */}
        <AuthInfoBox
          type="info"
          title="Application Process"
          message="Your application will be reviewed for verification. You'll be notified once your account is approved."
        />

        {/* Submit Button */}
        <Button
          title={auth.isLoading ? 'Submitting...' : 'Submit Application'}
          onPress={form.handleSubmit}
          loading={auth.isLoading || form.isSubmitting}
          disabled={auth.isLoading || form.isSubmitting}
          className="mt-6"
        />

        {/* Footer */}
        <AuthFooter
          variant="signup"
          userType="consultant"
          onSwitchRole={() => navigateToLogin('client')}
        />
      </AuthFormLayout>
    </>
  );
}