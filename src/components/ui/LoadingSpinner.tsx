interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  message?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  className = '', 
  message 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center space-y-4">
        <div className={`${sizeClasses[size]} border-2 border-white/30 border-t-cyan-400 
                      rounded-full animate-spin mx-auto`} />
        {message && (
          <p className="text-gray-400 text-sm">{message}</p>
        )}
      </div>
    </div>
  );
}