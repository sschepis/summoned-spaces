import { ReactNode } from 'react';
import { Video as LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  children?: ReactNode;
  className?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  children,
  className = '' 
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="space-y-6">
        <div className="w-16 h-16 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full 
                      flex items-center justify-center mx-auto">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="text-gray-400 max-w-md mx-auto leading-relaxed">{description}</p>
        </div>
        
        {action && (
          <Button
            variant="primary"
            icon={action.icon}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
        
        {children}
      </div>
    </div>
  );
}