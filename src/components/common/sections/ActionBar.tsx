import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal } from 'lucide-react';
import { Button } from '../../ui/Button';

interface ActionBarProps {
  actions?: ('like' | 'comment' | 'share' | 'bookmark' | 'more')[];
  metrics?: {
    likes?: number;
    comments?: number;
    shares?: number;
    hasLiked?: boolean;
    hasBookmarked?: boolean;
  };
  onAction?: (action: string, data?: any) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact';
  className?: string;
}

export function ActionBar({ 
  actions = ['like', 'comment', 'share'],
  metrics = {},
  onAction,
  size = 'md',
  variant = 'default',
  className = '' 
}: ActionBarProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const sizeConfig = {
    sm: {
      icon: 'w-4 h-4',
      text: 'text-xs',
      spacing: 'space-x-4'
    },
    md: {
      icon: 'w-5 h-5',
      text: 'text-sm',
      spacing: 'space-x-6'
    },
    lg: {
      icon: 'w-6 h-6',
      text: 'text-base',
      spacing: 'space-x-8'
    }
  };

  const config = sizeConfig[size];

  const actionConfig: Record<string, {
    icon: any;
    label: string;
    count?: number;
    active?: boolean;
    activeColor?: string;
    hoverColor: string;
  }> = {
    like: {
      icon: Heart,
      label: 'Like',
      count: metrics.likes,
      active: metrics.hasLiked,
      activeColor: 'text-pink-400',
      hoverColor: 'hover:text-pink-400'
    },
    comment: {
      icon: MessageCircle,
      label: 'Comment',
      count: metrics.comments,
      activeColor: 'text-blue-400',
      hoverColor: 'hover:text-blue-400'
    },
    share: {
      icon: Share,
      label: 'Share',
      count: metrics.shares,
      activeColor: 'text-green-400',
      hoverColor: 'hover:text-green-400'
    },
    bookmark: {
      icon: Bookmark,
      label: 'Bookmark',
      active: metrics.hasBookmarked,
      activeColor: 'text-yellow-400',
      hoverColor: 'hover:text-yellow-400'
    },
    more: {
      icon: MoreHorizontal,
      label: 'More',
      hoverColor: 'hover:text-white'
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center ${config.spacing} ${className}`}>
        {actions.map((action) => {
          const actionInfo = actionConfig[action];
          const Icon = actionInfo.icon;
          const isActive = actionInfo.active;
          
          return (
            <button
              key={action}
              onClick={() => onAction?.(action)}
              className={`
                flex items-center space-x-1 transition-colors
                ${isActive ? (actionInfo.activeColor || '') : `text-gray-400 ${actionInfo.hoverColor}`}
              `}
              title={actionInfo.label}
            >
              <Icon className={`${config.icon} ${isActive ? 'fill-current' : ''}`} />
              {actionInfo.count !== undefined && (
                <span className={`${config.text} font-medium`}>
                  {formatNumber(actionInfo.count)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className={`flex items-center ${config.spacing}`}>
        {actions.filter(a => a !== 'bookmark' && a !== 'more').map((action) => {
          const actionInfo = actionConfig[action];
          const Icon = actionInfo.icon;
          const isActive = actionInfo.active;
          
          return (
            <button
              key={action}
              onClick={() => onAction?.(action)}
              className={`
                flex items-center space-x-2 transition-colors group
                ${isActive ? (actionInfo.activeColor || '') : `text-gray-400 ${actionInfo.hoverColor}`}
              `}
            >
              <Icon className={`${config.icon} ${isActive ? 'fill-current' : 'group-hover:fill-current'}`} />
              {actionInfo.count !== undefined && (
                <span className={`${config.text} font-medium`}>
                  {formatNumber(actionInfo.count)}
                </span>
              )}
            </button>
          );
        })}
      </div>
      
      <div className="flex items-center space-x-2">
        {actions.includes('bookmark') && (
          <button
            onClick={() => onAction?.('bookmark')}
            className={`
              p-2 rounded-full transition-colors
              ${metrics.hasBookmarked 
                ? 'text-yellow-400 bg-yellow-400/10' 
                : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10'
              }
            `}
          >
            <Bookmark className={`${config.icon} ${metrics.hasBookmarked ? 'fill-current' : ''}`} />
          </button>
        )}
        
        {actions.includes('more') && (
          <button
            onClick={() => onAction?.('more')}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
          >
            <MoreHorizontal className={config.icon} />
          </button>
        )}
      </div>
    </div>
  );
}