import { UserAvatar } from '../UserAvatar';

interface AvatarGroupUser {
  id: string;
  name: string;
  avatar?: string;
  verified?: boolean;
}

interface AvatarGroupProps {
  users: AvatarGroupUser[];
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  overlap?: boolean;
  className?: string;
  onUserClick?: (userId: string) => void;
}

export function AvatarGroup({ 
  users, 
  max = 4, 
  size = 'md',
  overlap = true,
  className = '',
  onUserClick
}: AvatarGroupProps) {
  const displayUsers = users.slice(0, max);
  const remainingCount = users.length - max;
  
  const overlapClasses = overlap ? '-space-x-2' : 'space-x-2';
  
  return (
    <div className={`flex items-center ${overlapClasses} ${className}`}>
      {displayUsers.map((user, index) => (
        <div 
          key={user.id} 
          className={overlap ? 'relative hover:z-10' : ''}
          style={overlap ? { zIndex: displayUsers.length - index } : {}}
        >
          <UserAvatar
            src={user.avatar}
            name={user.name}
            size={size}
            verified={user.verified}
            onClick={onUserClick ? () => onUserClick(user.id) : undefined}
            className={overlap ? 'ring-2 ring-slate-800' : ''}
          />
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div 
          className={`
            flex items-center justify-center bg-gray-700 text-white font-medium
            rounded-full ring-2 ring-slate-800 hover:bg-gray-600 transition-colors
            ${getSizeClasses(size)}
            ${onUserClick ? 'cursor-pointer' : ''}
          `}
          onClick={onUserClick ? () => onUserClick('more') : undefined}
        >
          <span className="text-xs">+{remainingCount}</span>
        </div>
      )}
    </div>
  );
}

function getSizeClasses(size: 'xs' | 'sm' | 'md' | 'lg' | 'xl') {
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };
  
  return sizeClasses[size];
}