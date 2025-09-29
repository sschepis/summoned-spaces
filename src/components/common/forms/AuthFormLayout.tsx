import { ReactNode } from 'react';
import { Button } from '../../ui/Button';
import { Alert } from '../../ui/feedback/Alert';

interface AuthFormLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  submitLabel: string;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  error?: string;
  success?: string;
  footer?: ReactNode;
  className?: string;
}

export function AuthFormLayout({ 
  title, 
  subtitle, 
  children, 
  submitLabel,
  onSubmit,
  loading = false,
  error,
  success,
  footer,
  className = '' 
}: AuthFormLayoutProps) {
  return (
    <div className={`min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Brand */}
        <div className="text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 primary-gradient rounded-2xl mx-auto mb-4
                        flex items-center justify-center animate-glow">
            <span className="text-white font-bold text-2xl sm:text-3xl">S</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 text-gradient">{title}</h1>
          {subtitle && (
            <p className="text-gray-400 text-lg">{subtitle}</p>
          )}
        </div>

        {/* Form Card */}
        <div className="glass rounded-2xl p-6 sm:p-8">
          {/* Alerts */}
          {error && (
            <Alert variant="error" className="mb-6" dismissible>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert variant="success" className="mb-6" dismissible>
              {success}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-6">
            {children}
            
            {submitLabel && (
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                loading={loading}
                disabled={loading}
              >
                {submitLabel}
              </Button>
            )}
          </form>
        </div>

        {/* Footer */}
        {footer && (
          <div className="text-center space-y-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}