interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Toggle({ 
  checked, 
  onChange, 
  label, 
  description, 
  disabled = false,
  size = 'md',
  className = '' 
}: ToggleProps) {
  const sizeClasses = {
    sm: 'w-9 h-5',
    md: 'w-11 h-6',
    lg: 'w-14 h-8'
  };

  const knobSizeClasses = {
    sm: 'h-4 w-4 after:h-3 after:w-3',
    md: 'h-5 w-5 after:h-4 after:w-4',
    lg: 'h-7 w-7 after:h-6 after:w-6'
  };

  return (
    <div className={`flex items-center ${label ? 'justify-between' : ''} ${className}`}>
      {(label || description) && (
        <div className={label ? 'flex-1' : ''}>
          {label && (
            <div className="font-medium text-white">{label}</div>
          )}
          {description && (
            <div className="text-sm text-gray-400">{description}</div>
          )}
        </div>
      )}
      
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div className={`
          ${sizeClasses[size]} bg-gray-600 peer-focus:outline-none rounded-full peer 
          peer-checked:after:translate-x-full peer-checked:after:border-white 
          after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
          after:bg-white after:rounded-full ${knobSizeClasses[size]} after:transition-all 
          peer-checked:bg-cyan-500 transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `} />
      </label>
    </div>
  );
}