import { useState, useCallback, useEffect, useRef } from 'react';

// Form field configuration
interface FieldConfig<T = unknown> {
  initialValue?: T;
  validator?: (value: T, formData?: Record<string, unknown>) => string;
  asyncValidator?: (value: T, formData?: Record<string, unknown>) => Promise<string>;
  transform?: (value: T) => T;
  debounceMs?: number;
}

// Form configuration
interface FormConfig<T extends Record<string, unknown>> {
  initialValues: T;
  fields?: Partial<{ [K in keyof T]: FieldConfig<T[K]> }>;
  onSubmit?: (data: T) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  resetOnSuccess?: boolean;
}

// Form state
interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValidating: boolean;
  hasErrors: boolean;
  isDirty: boolean;
  submitCount: number;
}

// Form actions
interface FormActions<T> {
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setValues: (values: Partial<T>) => void;
  setError: <K extends keyof T>(field: K, error: string) => void;
  setErrors: (errors: Partial<Record<keyof T, string>>) => void;
  clearError: <K extends keyof T>(field: K) => void;
  clearErrors: () => void;
  setTouched: <K extends keyof T>(field: K, touched?: boolean) => void;
  setFieldTouched: (fields: Partial<Record<keyof T, boolean>>) => void;
  validateField: <K extends keyof T>(field: K) => Promise<boolean>;
  validateForm: () => Promise<boolean>;
  handleChange: <K extends keyof T>(field: K) => (value: T[K]) => void;
  handleBlur: <K extends keyof T>(field: K) => () => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  reset: (newValues?: Partial<T>) => void;
  resetField: <K extends keyof T>(field: K) => void;
}

// Enhanced form hook
export function useEnhancedForm<T extends Record<string, unknown>>(
  config: FormConfig<T>
): FormState<T> & FormActions<T> {
  const {
    initialValues,
    fields = {} as Partial<{ [K in keyof T]: FieldConfig<T[K]> }>,
    onSubmit,
    validateOnChange = true,
    validateOnBlur = true,
    resetOnSuccess = false,
  } = config;

  // State
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  // Refs for async operations
  const validationTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      // Clear any pending validations
      Object.values(validationTimeouts.current).forEach(clearTimeout);
    };
  }, []);

  // Computed values
  const hasErrors = Object.values(errors).some(error => !!error);
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  // Validation functions
  const validateField = useCallback(async <K extends keyof T>(field: K): Promise<boolean> => {
    const fieldConfig = fields?.[field];
    if (!fieldConfig) return true;

    const value = values[field];

    // Clear existing timeout
    if (validationTimeouts.current[field as string]) {
      clearTimeout(validationTimeouts.current[field as string]);
    }

    // Synchronous validation
    if (fieldConfig.validator) {
      const error = fieldConfig.validator(value, values);
      if (error) {
        setErrors(prev => ({ ...prev, [field]: error }));
        return false;
      }
    }

    // Asynchronous validation
    if (fieldConfig.asyncValidator) {
      setIsValidating(true);
      
      try {
        const error = await fieldConfig.asyncValidator(value, values);
        if (isMountedRef.current) {
          if (error) {
            setErrors(prev => ({ ...prev, [field]: error }));
            return false;
          } else {
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors[field];
              return newErrors;
            });
          }
        }
      } catch (_error) {
        if (isMountedRef.current) {
          setErrors(prev => ({
            ...prev,
            [field]: 'Validation failed'
          }));
          return false;
        }
      } finally {
        if (isMountedRef.current) {
          setIsValidating(false);
        }
      }
    } else {
      // Clear error if no async validator and sync validator passed
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    return true;
  }, [values, fields]);

  const validateForm = useCallback(async (): Promise<boolean> => {
    const fieldKeys = Object.keys(values) as Array<keyof T>;
    const validationResults = await Promise.all(
      fieldKeys.map(field => validateField(field))
    );
    return validationResults.every(Boolean);
  }, [values, validateField]);

  // Form actions
  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    const fieldConfig = fields?.[field];
    const transformedValue = fieldConfig?.transform ? fieldConfig.transform(value) : value;
    
    setValues(prev => ({ ...prev, [field]: transformedValue }));

    if (validateOnChange) {
      const debounceMs = fieldConfig?.debounceMs ?? 300;
      
      // Clear existing timeout
      if (validationTimeouts.current[field as string]) {
        clearTimeout(validationTimeouts.current[field as string]);
      }

      // Set new timeout
      validationTimeouts.current[field as string] = setTimeout(() => {
        validateField(field);
      }, debounceMs);
    }
  }, [fields, validateOnChange, validateField]);

  const setFormValues = useCallback((newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, []);

  const setError = useCallback(<K extends keyof T>(field: K, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const setFormErrors = useCallback((newErrors: Partial<Record<keyof T, string>>) => {
    setErrors(prev => ({ ...prev, ...newErrors }));
  }, []);

  const clearError = useCallback(<K extends keyof T>(field: K) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setFieldTouched = useCallback(<K extends keyof T>(field: K, isTouched = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
  }, []);

  const setFieldsTouched = useCallback((fields: Partial<Record<keyof T, boolean>>) => {
    setTouched(prev => ({ ...prev, ...fields }));
  }, []);

  const handleChange = useCallback(<K extends keyof T>(field: K) => 
    (value: T[K]) => {
      setValue(field, value);
    }, [setValue]);

  const handleBlur = useCallback(<K extends keyof T>(field: K) => 
    () => {
      setFieldTouched(field, true);
      if (validateOnBlur) {
        validateField(field);
      }
    }, [setFieldTouched, validateOnBlur, validateField]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    setSubmitCount(prev => prev + 1);
    setIsSubmitting(true);

    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Record<keyof T, boolean>);
    setTouched(allTouched);

    try {
      const isValid = await validateForm();
      
      if (isValid && onSubmit) {
        await onSubmit(values);
        
        if (resetOnSuccess) {
          reset();
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      // You might want to set a general form error here
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm, onSubmit, resetOnSuccess]);

  const reset = useCallback((newValues?: Partial<T>) => {
    const resetValues = newValues ? { ...initialValues, ...newValues } : initialValues;
    setValues(resetValues);
    setErrors({});
    setTouched({});
    setSubmitCount(0);
  }, [initialValues]);

  const resetField = useCallback(<K extends keyof T>(field: K) => {
    setValues(prev => ({ ...prev, [field]: initialValues[field] }));
    clearError(field);
    setFieldTouched(field, false);
  }, [initialValues, clearError, setFieldTouched]);

  return {
    // State
    values,
    errors,
    touched,
    isSubmitting,
    isValidating,
    hasErrors,
    isDirty,
    submitCount,
    
    // Actions
    setValue,
    setValues: setFormValues,
    setError,
    setErrors: setFormErrors,
    clearError,
    clearErrors,
    setTouched: setFieldTouched,
    setFieldTouched: setFieldsTouched,
    validateField,
    validateForm,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    resetField,
  };
}

// Common validators
export const validators = {
  required: (message = 'This field is required') => 
    (value: unknown) => !value ? message : '',
  
  email: (message = 'Invalid email address') => 
    (value: string) => {
      if (!value) return '';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? '' : message;
    },
  
  minLength: (min: number, message?: string) => 
    (value: string) => {
      if (!value) return '';
      const msg = message || `Must be at least ${min} characters`;
      return value.length >= min ? '' : msg;
    },
  
  maxLength: (max: number, message?: string) => 
    (value: string) => {
      if (!value) return '';
      const msg = message || `Must be no more than ${max} characters`;
      return value.length <= max ? '' : msg;
    },
  
  pattern: (regex: RegExp, message = 'Invalid format') => 
    (value: string) => {
      if (!value) return '';
      return regex.test(value) ? '' : message;
    },
  
  numeric: (message = 'Must be a number') => 
    (value: string) => {
      if (!value) return '';
      return !isNaN(Number(value)) ? '' : message;
    },
  
  url: (message = 'Invalid URL') => 
    (value: string) => {
      if (!value) return '';
      try {
        new URL(value);
        return '';
      } catch {
        return message;
      }
    },
  
  confirmed: (confirmField: string, message = 'Fields do not match') =>
    (value: unknown, formData?: Record<string, unknown>) => {
      if (!value || !formData) return '';
      return value === formData[confirmField] ? '' : message;
    },
};

// Async validators
export const asyncValidators = {
  uniqueUsername: (message = 'Username is already taken') => 
    async (value: string): Promise<string> => {
      if (!value) return '';
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock check - replace with actual API call
      const takenUsernames = ['admin', 'user', 'test'];
      return takenUsernames.includes(value.toLowerCase()) ? message : '';
    },
  
  uniqueEmail: (message = 'Email is already registered') => 
    async (value: string): Promise<string> => {
      if (!value) return '';
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock check - replace with actual API call
      const takenEmails = ['admin@example.com', 'test@example.com'];
      return takenEmails.includes(value.toLowerCase()) ? message : '';
    },
};