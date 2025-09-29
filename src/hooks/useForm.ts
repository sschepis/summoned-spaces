import { useState, useCallback } from 'react';

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Record<string, string>;
  onSubmit: (values: T) => void | Promise<void>;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((name: keyof T) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : e.target.value;
    
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as string]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const handleBlur = useCallback((name: keyof T) => () => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate single field on blur
    if (validate) {
      const validationErrors = validate(values);
      if (validationErrors[name as string]) {
        setErrors(prev => ({ ...prev, [name]: validationErrors[name as string] }));
      }
    }
  }, [validate, values]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);
    
    // Validate all fields
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
      
      if (Object.keys(validationErrors).length > 0) {
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [name as string]: error }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    setFieldError,
    isValid: Object.keys(errors).length === 0
  };
}

// Common validators
export const validators = {
  required: (value: any, fieldName: string = 'Field') => 
    !value ? `${fieldName} is required` : '',
  
  email: (value: string) => 
    !value ? 'Email is required' : 
    !/\S+@\S+\.\S+/.test(value) ? 'Email is invalid' : '',
  
  minLength: (min: number) => (value: string, fieldName: string = 'Field') =>
    !value ? `${fieldName} is required` :
    value.length < min ? `${fieldName} must be at least ${min} characters` : '',
  
  maxLength: (max: number) => (value: string, fieldName: string = 'Field') =>
    value.length > max ? `${fieldName} must be at most ${max} characters` : '',
  
  pattern: (pattern: RegExp, message: string) => (value: string) =>
    !pattern.test(value) ? message : '',
  
  match: (fieldName: string, message: string = 'Fields must match') => 
    (value: string, allValues: Record<string, any>) =>
      value !== allValues[fieldName] ? message : ''
};