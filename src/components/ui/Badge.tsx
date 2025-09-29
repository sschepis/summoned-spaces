import { ReactNode } from 'react';
import { Video as LucideIcon } from 'lucide-react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'cyan';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  className?: string;
}

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'md', 
  icon: Icon,
  className = '' 
}: BadgeProps) {
  const variantClasses = {
    default: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    success: 'bg-green-500/20 text-green-300 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    error: 'bg-red-500/20 text-red-300 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    cyan: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <span className={`
      inline-flex items-center space-x-1 rounded-full border font-medium
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${className}
    `}>
      {Icon && (
        <Icon className={iconSizeClasses[size]} />
      )}
      <span>{children}</span>
    </span>
  );
}