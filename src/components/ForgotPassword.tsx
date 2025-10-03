import { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { AuthFormLayout } from './common/forms/AuthFormLayout';
import { FormField } from './ui/forms/FormField';
import { Alert } from './ui/feedback/Alert';
import { useForm, validators } from '../hooks/useForm';
import { communicationManager, type CommunicationMessage } from '../services/communication-manager';

interface ForgotPasswordProps {
  onBack?: () => void; // Make optional since it's not used
  onBackToLogin: () => void;
}

export function ForgotPasswordRefactored({
  onBackToLogin
}: ForgotPasswordProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generalError, setGeneralError] = useState('');
  
  const form = useForm({
    initialValues: {
      email: ''
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      
      // Email validation
      const emailError = validators.email(values.email);
      if (emailError) errors.email = emailError;
      
      return errors;
    },
    onSubmit: async (values) => {
      setGeneralError('');
      
      try {
        // Set up message handler for password reset response
        let resetResolve: () => void;
        let resetReject: (error: Error) => void;
        const resetPromise = new Promise<void>((resolve, reject) => {
          resetResolve = resolve;
          resetReject = reject;
        });
        
        const handleResetMessage = (message: CommunicationMessage) => {
          if (message.kind === 'passwordResetSent') {
            console.log('Password reset email sent to:', values.email);
            setIsSubmitted(true);
            resetResolve();
          } else if (message.kind === 'error') {
            const payload = message.payload as Record<string, unknown>;
            if (payload.requestKind === 'requestPasswordReset') {
              const errorMessage = (payload.message as string) || 'Failed to send reset email. Please try again.';
              setGeneralError(errorMessage);
              resetReject(new Error(errorMessage));
            }
          }
        };
        
        // Listen for the response
        communicationManager.onMessage(handleResetMessage);
        
        // Send password reset request
        await communicationManager.send({
          kind: 'requestPasswordReset',
          payload: { email: values.email }
        });
        
        // Wait for the response with a timeout
        await Promise.race([
          resetPromise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timed out. Please try again.')), 10000)
          )
        ]);
      } catch (error) {
        if (error instanceof Error) {
          setGeneralError(error.message);
        } else {
          setGeneralError('Failed to send reset email. Please try again.');
        }
      }
    }
  });

  const footer = (
    <button
      onClick={onBackToLogin}
      className="flex items-center justify-center space-x-2 text-gray-400 hover:text-white transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      <span>Back to login</span>
    </button>
  );

  if (isSubmitted) {
    return (
      <AuthFormLayout
        title="Check Your Email"
        subtitle="We've sent you a password reset link"
        submitLabel=""
        onSubmit={(e) => e.preventDefault()}
        footer={footer}
      >
        <Alert variant="success" className="mb-6">
          <p className="mb-2">
            We've sent a password reset link to <strong>{form.values.email}</strong>
          </p>
          <p className="text-sm">
            Please check your email and follow the instructions to reset your password.
            The link will expire in 24 hours.
          </p>
        </Alert>
        
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-400">
            Didn't receive the email? Check your spam folder or
          </p>
          <button
            onClick={() => {
              setIsSubmitted(false);
              form.reset();
            }}
            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            Try again with a different email
          </button>
        </div>
      </AuthFormLayout>
    );
  }

  return (
    <AuthFormLayout
      title="Forgot Password?"
      subtitle="No worries, we'll send you reset instructions"
      submitLabel="Send Reset Link"
      onSubmit={form.handleSubmit}
      loading={form.isSubmitting}
      error={generalError}
      footer={footer}
    >
      <FormField
        name="email"
        label="Email Address"
        type="email"
        value={form.values.email}
        onChange={form.handleChange('email')}
        onBlur={form.handleBlur('email')}
        error={form.touched.email ? form.errors.email : undefined}
        icon={Mail}
        placeholder="your@email.com"
        helperText="Enter the email associated with your account"
        required
      />
      
      <Alert variant="info" className="mt-4">
        <p className="text-sm">
          We'll send a password reset link to your email address. 
          Make sure to check your spam folder if you don't see it within a few minutes.
        </p>
      </Alert>
    </AuthFormLayout>
  );
}

// Export with the original name for compatibility
export const ForgotPassword = ForgotPasswordRefactored;