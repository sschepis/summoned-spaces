interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({ 
  variant = 'text', 
  width, 
  height,
  className = '',
  animation = 'pulse'
}: SkeletonProps) {
  const baseClasses = 'bg-white/10';
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  };
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg'
  };
  
  const defaultSizes = {
    text: { width: '100%', height: '1rem' },
    circular: { width: '3rem', height: '3rem' },
    rectangular: { width: '100%', height: '6rem' },
    rounded: { width: '100%', height: '6rem' }
  };
  
  const finalWidth = width || defaultSizes[variant].width;
  const finalHeight = height || defaultSizes[variant].height;
  
  return (
    <div
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${animationClasses[animation]}
        ${className}
      `}
      style={{
        width: typeof finalWidth === 'number' ? `${finalWidth}px` : finalWidth,
        height: typeof finalHeight === 'number' ? `${finalHeight}px` : finalHeight
      }}
    />
  );
}

// Skeleton group for multiple loading items
interface SkeletonGroupProps {
  count?: number;
  children?: React.ReactNode;
  className?: string;
}

export function SkeletonGroup({ count = 3, children, className = '' }: SkeletonGroupProps) {
  if (children) {
    return <div className={`space-y-3 ${className}`}>{children}</div>;
  }
  
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} />
      ))}
    </div>
  );
}