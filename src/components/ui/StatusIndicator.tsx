import { Video as LucideIcon } from 'lucide-react';

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'away' | 'busy';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function StatusIndicator({ 
  status, 
  size = 'md', 
  showText = false,
  className = '' 
}: StatusIndicatorProps) {
  const statusConfig = {
    online: { color: 'bg-green-400', text: 'Online' },
    offline: { color: 'bg-gray-500', text: 'Offline' },
    away: { color: 'bg-yellow-400', text: 'Away' },
    busy: { color: 'bg-red-400', text: 'Busy' }
  };

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const config = statusConfig[status];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${sizeClasses[size]} ${config.color} rounded-full 
                    ${status === 'online' ? 'animate-pulse' : ''}`} />
      {showText && (
        <span className="text-sm text-gray-400">{config.text}</span>
      )}
    </div>
  );
}