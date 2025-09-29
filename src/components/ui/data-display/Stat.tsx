import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatProps {
  label: string;
  value: string | number;
  change?: {
    value: string | number;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'card';
  className?: string;
}

export function Stat({ 
  label, 
  value, 
  change,
  icon,
  size = 'md',
  variant = 'default',
  className = '' 
}: StatProps) {
  const sizeClasses = {
    sm: {
      value: 'text-lg font-semibold',
      label: 'text-xs',
      change: 'text-xs'
    },
    md: {
      value: 'text-2xl font-bold',
      label: 'text-sm',
      change: 'text-sm'
    },
    lg: {
      value: 'text-3xl font-bold',
      label: 'text-base',
      change: 'text-base'
    }
  };

  const trendIcons = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus
  };

  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-gray-400'
  };

  const TrendIcon = change ? trendIcons[change.trend] : null;

  if (variant === 'card') {
    return (
      <div className={`bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 ${className}`}>
        {icon && (
          <div className="mb-4">
            {icon}
          </div>
        )}
        <div className={`${sizeClasses[size].value} text-white mb-2`}>
          {value}
        </div>
        <div className={`${sizeClasses[size].label} text-gray-400`}>
          {label}
        </div>
        {change && (
          <div className={`flex items-center space-x-1 mt-3 ${trendColors[change.trend]}`}>
            {TrendIcon && <TrendIcon className="w-4 h-4" />}
            <span className={sizeClasses[size].change}>{change.value}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`text-center ${className}`}>
      {icon && (
        <div className="mb-2">
          {icon}
        </div>
      )}
      <div className={`${sizeClasses[size].value} text-white`}>
        {value}
      </div>
      <div className={`${sizeClasses[size].label} text-gray-400`}>
        {label}
      </div>
      {change && (
        <div className={`flex items-center justify-center space-x-1 mt-1 ${trendColors[change.trend]}`}>
          {TrendIcon && <TrendIcon className="w-3 h-3" />}
          <span className={sizeClasses[size].change}>{change.value}</span>
        </div>
      )}
    </div>
  );
}