import { useState, useCallback } from 'react';

interface FormErrors {
  [key: string]: string;
}

interface FormTouched {
  [key: string]: boolean;
}

/**
 * useForm - Custom hook for form state management
 * Handles values, errors, touched fields, and form submission
 * 
 * @template T - Type of form values
 * @param initialValues - Initial form state
 * @param onSubmit - Callback when form is submitted
 * @param validate - Optional validation function
 * @returns Form state and handlers
 * 
 * @example
 * const form = useForm(
 *   { email: '', password: '' },
 *   async (values) => {
 *     await api.login(values);
 *   },
 *   (values) => {
 *     const errors = {};
 *     if (!values.email) errors.email = 'Email is required';
 *     return errors;
 *   }
 * );
 */
export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  onSubmit: (values: T) => Promise<void> | void,
  validate?: (values: T) => FormErrors
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setFieldValue = useCallback((field: string, value: any) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  const setFieldTouched = useCallback((field: string, touched: boolean) => {
    setTouched((prev) => ({
      ...prev,
      [field]: touched,
    }));
  }, []);

  const handleChange = useCallback(
    (field: string) => (value: string) => {
      setFieldValue(field, value);
      // Clear error when user starts typing
      if (errors[field]) {
        setFieldError(field, '');
      }
    },
    [setFieldValue, setFieldError, errors]
  );

  const handleBlur = useCallback(
    (field: string) => () => {
      setFieldTouched(field, true);
      // Validate on blur if validator is provided
      if (validate) {
        const fieldErrors = validate(values);
        if (fieldErrors[field]) {
          setFieldError(field, fieldErrors[field]);
        }
      }
    },
    [values, validate, setFieldTouched, setFieldError]
  );

  const handleSubmit = useCallback(
    async (e?: any) => {
      if (e?.preventDefault) {
        e.preventDefault();
      }

      // Validate all fields
      if (validate) {
        const validationErrors = validate(values);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) {
          // Mark fields as touched so errors are displayed immediately
          setTouched((prev) => {
            const next = { ...prev } as FormTouched;
            // Prefer marking only fields with errors as touched
            for (const key of Object.keys(validationErrors)) {
              next[key] = true;
            }
            return next;
          });
          return;
        }
      }

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (err) {
        console.error('Form submission error:', err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validate, onSubmit]
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValues,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  };
};

export default useForm;
