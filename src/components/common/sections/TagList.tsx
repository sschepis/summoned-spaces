import { Badge } from '../../ui/Badge';

interface TagListProps {
  tags: string[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'cyan';
  onClick?: (tag: string) => void;
  className?: string;
}

export function TagList({ 
  tags, 
  max = 0, 
  size = 'sm',
  variant = 'cyan',
  onClick,
  className = '' 
}: TagListProps) {
  const displayTags = max > 0 ? tags.slice(0, max) : tags;
  const remainingCount = max > 0 ? tags.length - max : 0;
  
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {displayTags.map((tag) => (
        onClick ? (
          <button
            key={tag}
            onClick={() => onClick(tag)}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <Badge variant={variant} size={size}>
              {tag}
            </Badge>
          </button>
        ) : (
          <Badge key={tag} variant={variant} size={size}>
            {tag}
          </Badge>
        )
      ))}
      
      {remainingCount > 0 && (
        <span className={`
          text-gray-400 flex items-center
          ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}
        `}>
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}