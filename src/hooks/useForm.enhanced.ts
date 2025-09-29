import { useState, useCallback, useEffect, useRef } from 'react';

// Validator function type
type Validator<T = any> = (value: T, allValues?: Record<string, any>) => string;

// Async validator function type
type AsyncValidator<T = any> = (value: T, allValues?: Record<string, any>) => Promise<string>;

// Form field configuration
interface FieldConfig<T = any> {
  validator?: Validator<T>;
  asyncValidator?: AsyncValidator<T>;
  transform?: (value: T) => T;
  debounceMs?: number;
}

// Form configuration
interface FormConfig<T extends Record<string, any>> {
  initialValues: T;
  fields?: Record<string, FieldConfig>;
  onSubmit?: (data: T) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  resetOnSuccess?: boolean;
}

// Form state
interface FormState<T> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValidating: boolean;
  hasErrors: boolean;
  isDirty: boolean;
  submitCount: number;
}

// Form actions
interface FormActions<T> {
  setValue: (field: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, error: string) => void;
  setErrors: (errors: Record<string, string>) => void;
  clearError: (field: keyof T) => void;
  clearErrors: () => void;
  setTouched: (field: keyof T, touched?: boolean) => void;
  setFieldTouched: (fields: Record<string, boolean>) => void;
  validateField: (field: keyof T) => Promise<boolean>;
  validateForm: () => Promise<boolean>;
  handleChange: (field: keyof T) => (value: any) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  reset: (newValues?: Partial<T>) => void;
  resetField: (field: keyof T) => void;
}

// Enhanced form hook
export function useFormEnhanced<T extends Record<string, any>>(
  config: FormConfig<T>
): FormState<T> & FormActions<T> {
  const {
    initialValues,
    fields = {},
    onSubmit,
    validateOnChange = true,
    validateOnBlur = true,
    resetOnSuccess = false,
  } = config;

  // State
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
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
  const validateField = useCallback(async (field: keyof T): Promise<boolean> => {
    const fieldConfig = fields[field as string];
    if (!fieldConfig) return true;

    const value = values[field];
    const fieldName = field as string;

    // Clear existing timeout
    if (validationTimeouts.current[fieldName]) {
      clearTimeout(validationTimeouts.current[fieldName]);
    }

    // Synchronous validation
    if (fieldConfig.validator) {
      const error = fieldConfig.validator(value, values);
      if (error) {
        setErrors(prev => ({ ...prev, [fieldName]: error }));
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
            setErrors(prev => ({ ...prev, [fieldName]: error }));
            return false;
          } else {
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors[fieldName];
              return newErrors;
            });
          }
        }
      } catch (error) {
        if (isMountedRef.current) {
          setErrors(prev => ({ 
            ...prev, 
            [fieldName]: 'Validation failed' 
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
        delete newErrors[fieldName];
        return newErrors;
      });
    }

    return true;
  }, [values, fields]);

  const validateForm = useCallback(async (): Promise<boolean> => {
    const fieldKeys = Object.keys(values);
    const validationResults = await Promise.all(
      fieldKeys.map(field => validateField(field))
    );
    return validationResults.every(Boolean);
  }, [values, validateField]);

  // Form actions
  const setValue = useCallback((field: keyof T, value: any) => {
    const fieldConfig = fields[field as string];
    const transformedValue = fieldConfig?.transform ? fieldConfig.transform(value) : value;
    
    setValues(prev => ({ ...prev, [field]: transformedValue }));

    if (validateOnChange) {
      const debounceMs = fieldConfig?.debounceMs ?? 300;
      const fieldName = field as string;
      
      // Clear existing timeout
      if (validationTimeouts.current[fieldName]) {
        clearTimeout(validationTimeouts.current[fieldName]);
      }

      // Set new timeout
      validationTimeouts.current[fieldName] = setTimeout(() => {
        validateField(field);
      }, debounceMs);
    }
  }, [fields, validateOnChange, validateField]);

  const setFormValues = useCallback((newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, []);

  const setError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field as string]: error }));
  }, []);

  const setFormErrors = useCallback((newErrors: Record<string, string>) => {
    setErrors(prev => ({ ...prev, ...newErrors }));
  }, []);

  const clearError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field as string];
      return newErrors;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setFieldTouched = useCallback((field: keyof T, isTouched = true) => {
    setTouched(prev => ({ ...prev, [field as string]: isTouched }));
  }, []);

  const setFieldsTouched = useCallback((fields: Record<string, boolean>) => {
    setTouched(prev => ({ ...prev, ...fields }));
  }, []);

  const handleChange = useCallback((field: keyof T) => 
    (value: any) => {
      setValue(field, value);
    }, [setValue]);

  const handleBlur = useCallback((field: keyof T) => 
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
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
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

  const resetField = useCallback((field: keyof T) => {
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
    (value: any): string => !value ? message : '',
  
  email: (message = 'Invalid email address') => 
    (value: string): string => {
      if (!value) return '';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? '' : message;
    },
  
  minLength: (min: number, message?: string) => 
    (value: string): string => {
      if (!value) return '';
      const msg = message || `Must be at least ${min} characters`;
      return value.length >= min ? '' : msg;
    },
  
  maxLength: (max: number, message?: string) => 
    (value: string): string => {
      if (!value) return '';
      const msg = message || `Must be no more than ${max} characters`;
      return value.length <= max ? '' : msg;
    },
  
  pattern: (regex: RegExp, message = 'Invalid format') => 
    (value: string): string => {
      if (!value) return '';
      return regex.test(value) ? '' : message;
    },
  
  numeric: (message = 'Must be a number') => 
    (value: string): string => {
      if (!value) return '';
      return !isNaN(Number(value)) ? '' : message;
    },
  
  url: (message = 'Invalid URL') => 
    (value: string): string => {
      if (!value) return '';
      try {
        new URL(value);
        return '';
      } catch {
        return message;
      }
    },
  
  confirmed: (confirmField: string, message = 'Fields do not match') => 
    (value: any, formData?: Record<string, any>): string => {
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