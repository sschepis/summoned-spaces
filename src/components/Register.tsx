import { useState } from 'react';
import { Mail, Lock, User } from 'lucide-react';
import { AuthFormLayout } from './common/forms/AuthFormLayout';
import { FormField } from './ui/forms/FormField';
import { FormGroup } from './ui/forms/FormGroup';
import { useForm, validators } from '../hooks/useForm';
import { useAuth } from '../contexts/AuthContext';

interface RegisterProps {
  onSwitchToLogin: () => void;
  onRegisterSuccess: () => void;
}

export function RegisterRefactored({
  onSwitchToLogin,
  onRegisterSuccess
}: RegisterProps) {
  const { register } = useAuth();
  const [generalError, setGeneralError] = useState('');
  
  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      
      // Name validation
      const nameError = validators.required(values.name, 'Name');
      if (nameError) errors.name = nameError;
      
      // Email validation
      const emailError = validators.email(values.email);
      if (emailError) errors.email = emailError;
      
      // Password validation
      const passwordError = validators.minLength(8)(values.password, 'Password');
      if (passwordError) errors.password = passwordError;
      
      // Confirm password validation
      if (!values.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (values.password !== values.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
      
      return errors;
    },
    onSubmit: async (values) => {
      setGeneralError('');
      
      try {
        // Use AuthContext register method
        await register(values.email, values.password, values.name);
        onRegisterSuccess();
      } catch (error) {
        setGeneralError(error instanceof Error ? error.message : 'Registration failed. Please try again.');
      }
    }
  });

  const footer = (
    <p className="text-gray-400">
      Already have an account?{' '}
      <button
        onClick={onSwitchToLogin}
        className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
      >
        Sign in
      </button>
    </p>
  );

  return (
    <AuthFormLayout
      title="Create Account"
      subtitle="Join the quantum realm"
      submitLabel="Create Account"
      onSubmit={form.handleSubmit}
      loading={form.isSubmitting}
      error={generalError}
      footer={footer}
    >
      <FormGroup>
        <FormField
          name="name"
          label="Full Name"
          type="text"
          value={form.values.name}
          onChange={form.handleChange('name')}
          onBlur={form.handleBlur('name')}
          error={form.touched.name ? form.errors.name : undefined}
          icon={User}
          placeholder="John Doe"
          required
        />
        
        <FormField
          name="email"
          label="Email"
          type="email"
          value={form.values.email}
          onChange={form.handleChange('email')}
          onBlur={form.handleBlur('email')}
          error={form.touched.email ? form.errors.email : undefined}
          icon={Mail}
          placeholder="your@email.com"
          required
        />
        
        <FormField
          name="password"
          label="Password"
          type="password"
          value={form.values.password}
          onChange={form.handleChange('password')}
          onBlur={form.handleBlur('password')}
          error={form.touched.password ? form.errors.password : undefined}
          icon={Lock}
          placeholder="••••••••"
          helperText="Must be at least 8 characters"
          required
        />
        
        <FormField
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          value={form.values.confirmPassword}
          onChange={form.handleChange('confirmPassword')}
          onBlur={form.handleBlur('confirmPassword')}
          error={form.touched.confirmPassword ? form.errors.confirmPassword : undefined}
          icon={Lock}
          placeholder="••••••••"
          required
        />
      </FormGroup>
      
      <div className="mt-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="w-4 h-4 bg-white/10 border border-white/20 rounded text-cyan-500 
                     focus:ring-2 focus:ring-cyan-500 focus:ring-offset-0 focus:ring-offset-transparent"
          />
          <span className="text-sm text-gray-300">
            I agree to the{' '}
            <a href="#" className="text-cyan-400 hover:text-cyan-300">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-cyan-400 hover:text-cyan-300">
              Privacy Policy
            </a>
          </span>
        </label>
      </div>
    </AuthFormLayout>
  );
}

// Export with the original name for compatibility
export const Register = RegisterRefactored;