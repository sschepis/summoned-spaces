import { User } from 'lucide-react';

interface UserAvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showOnlineStatus?: boolean;
  isOnline?: boolean;
  verified?: boolean;
  className?: string;
  onClick?: () => void;
}

export function UserAvatar({ 
  src, 
  name, 
  size = 'md', 
  showOnlineStatus = false,
  isOnline = false,
  verified = false,
  className = '',
  onClick 
}: UserAvatarProps) {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const onlineIndicatorSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4'
  };

  const verifiedBadgeSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className={`relative inline-block ${onClick ? 'cursor-pointer' : ''} ${className}`} onClick={onClick}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white/10 
                   ${onClick ? 'hover:border-cyan-400/50 transition-colors' : ''}`}
        />
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-teal-500 
                      border-2 border-white/10 flex items-center justify-center
                      ${onClick ? 'hover:border-cyan-400/50 transition-colors' : ''}`}>
          <span className="text-white font-medium text-sm">
            {getInitials(name)}
          </span>
        </div>
      )}
      
      {showOnlineStatus && (
        <div className={`absolute -bottom-0.5 -right-0.5 ${onlineIndicatorSizes[size]} 
                      ${isOnline ? 'bg-green-400' : 'bg-gray-500'} rounded-full 
                      border-2 border-slate-800`} />
      )}
      
      {verified && (
        <div className={`absolute -bottom-1 -right-1 ${verifiedBadgeSizes[size]} bg-blue-500 
                      rounded-full flex items-center justify-center border-2 border-slate-800`}>
          <div className="w-1/2 h-1/2 bg-white rounded-full" />
        </div>
      )}
    </div>
  );
}