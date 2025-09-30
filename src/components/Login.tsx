import { useState } from 'react';
import { Lock, User } from 'lucide-react';
import { AuthFormLayout } from './common/forms/AuthFormLayout';
import { FormField } from './ui/forms/FormField';
import { FormGroup } from './ui/forms/FormGroup';
import { useAuth } from '../contexts/AuthContext';

interface LoginProps {
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
  onLoginSuccess: () => void;
}

export function Login({
  onSwitchToRegister,
  onSwitchToForgotPassword,
  onLoginSuccess
}: LoginProps) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.username) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setGeneralError('');
    
    try {
      // Use AuthContext login method
      await login(formData.username, formData.password);
      onLoginSuccess();
    } catch (error) {
      setGeneralError(error instanceof Error ? error.message : 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <>
      <p className="text-gray-400">
        Don't have an account?{' '}
        <button
          onClick={onSwitchToRegister}
          className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
        >
          Sign up
        </button>
      </p>
      <button
        onClick={onSwitchToForgotPassword}
        className="text-sm text-gray-400 hover:text-white transition-colors mt-2"
      >
        Forgot your password?
      </button>
    </>
  );

  return (
    <AuthFormLayout
      title="Welcome Back"
      subtitle="Enter the quantum realm"
      submitLabel="Sign In"
      onSubmit={handleSubmit}
      loading={loading}
      error={generalError}
      footer={footer}
    >
      <FormGroup>
        <FormField
          name="username"
          label="Username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
          icon={User}
          placeholder="your_username"
          required
        />
        
        <FormField
          name="password"
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          icon={Lock}
          placeholder="••••••••"
          required
        />
      </FormGroup>
    </AuthFormLayout>
  );
}
