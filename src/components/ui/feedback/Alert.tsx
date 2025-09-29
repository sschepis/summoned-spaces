import { ReactNode } from 'react';
import { AlertCircle, CheckCircle, XCircle, Info, X } from 'lucide-react';

interface AlertProps {
  children: ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function Alert({ 
  children, 
  variant = 'info', 
  title,
  dismissible = false,
  onDismiss,
  className = '' 
}: AlertProps) {
  const variantStyles = {
    info: {
      container: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
      icon: Info,
      iconColor: 'text-blue-400'
    },
    success: {
      container: 'bg-green-500/10 border-green-500/20 text-green-300',
      icon: CheckCircle,
      iconColor: 'text-green-400'
    },
    warning: {
      container: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300',
      icon: AlertCircle,
      iconColor: 'text-yellow-400'
    },
    error: {
      container: 'bg-red-500/10 border-red-500/20 text-red-300',
      icon: XCircle,
      iconColor: 'text-red-400'
    }
  };

  const { container, icon: Icon, iconColor } = variantStyles[variant];

  return (
    <div className={`relative rounded-lg border p-4 ${container} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">{title}</h3>
          )}
          <div className="text-sm">{children}</div>
        </div>
        {dismissible && (
          <button
            onClick={onDismiss}
            className="ml-3 flex-shrink-0 inline-flex text-gray-400 hover:text-gray-300 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 
                     focus:ring-cyan-500 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}