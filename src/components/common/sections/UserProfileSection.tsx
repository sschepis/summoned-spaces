import { UserAvatar } from '../../ui/UserAvatar';
import { Badge } from '../../ui/Badge';
import { User } from '../../../types/common';

interface UserProfileSectionProps {
  user: Partial<User> & {
    name: string;
    username?: string;
    avatar?: string;
    bio?: string;
    verified?: boolean;
    followsMe?: boolean;
  };
  size?: 'sm' | 'md' | 'lg';
  showUsername?: boolean;
  showBio?: boolean;
  showFollowsYou?: boolean;
  showVerified?: boolean;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  onClick?: () => void;
}

export function UserProfileSection({ 
  user,
  size = 'md',
  showUsername = true,
  showBio = false,
  showFollowsYou = false,
  showVerified = true,
  orientation = 'horizontal',
  className = '',
  onClick
}: UserProfileSectionProps) {
  const sizeConfig = {
    sm: {
      avatar: 'sm' as const,
      name: 'text-sm font-medium',
      username: 'text-xs',
      bio: 'text-xs',
      spacing: 'space-x-2'
    },
    md: {
      avatar: 'md' as const,
      name: 'text-base font-semibold',
      username: 'text-sm',
      bio: 'text-sm',
      spacing: 'space-x-3'
    },
    lg: {
      avatar: 'lg' as const,
      name: 'text-lg font-bold',
      username: 'text-base',
      bio: 'text-base',
      spacing: 'space-x-4'
    }
  };

  const config = sizeConfig[size];
  const isVertical = orientation === 'vertical';

  return (
    <div 
      className={`
        flex ${isVertical ? 'flex-col items-center text-center' : 'items-start'} 
        ${isVertical ? 'space-y-3' : config.spacing}
        ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <UserAvatar
        src={user.avatar}
        name={user.name}
        size={config.avatar}
        verified={showVerified && user.verified}
      />
      
      <div className={isVertical ? '' : 'flex-1 min-w-0'}>
        <div className={`flex items-center ${isVertical ? 'justify-center' : ''} space-x-2`}>
          <h3 className={`${config.name} text-white truncate`}>
            {user.name}
          </h3>
          {showFollowsYou && user.followsMe && (
            <Badge variant="success" size="sm">
              Follows you
            </Badge>
          )}
        </div>
        
        {showUsername && user.username && (
          <p className={`${config.username} text-gray-400 truncate`}>
            {user.username}
          </p>
        )}
        
        {showBio && user.bio && (
          <p className={`${config.bio} text-gray-300 mt-2 ${isVertical ? '' : 'line-clamp-2'}`}>
            {user.bio}
          </p>
        )}
      </div>
    </div>
  );
}