import { ReactNode } from 'react';
import { ArrowLeft, Video as LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
    variant?: 'primary' | 'secondary';
  };
  children?: ReactNode;
  className?: string;
}

export function PageHeader({ 
  title, 
  subtitle, 
  onBack, 
  action,
  children,
  className = '' 
}: PageHeaderProps) {
  return (
    <div className={`flex items-center space-x-4 mb-8 ${className}`}>
      {onBack && (
        <button
          onClick={onBack}
          className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      )}
      
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
        {subtitle && <p className="text-gray-400">{subtitle}</p>}
      </div>
      
      {action && (
        <Button
          variant={action.variant || 'primary'}
          icon={action.icon}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
      
      {children}
    </div>
  );
}