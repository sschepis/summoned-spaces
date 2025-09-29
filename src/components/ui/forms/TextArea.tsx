import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  label,
  error,
  helperText,
  required = false,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        className={`
          w-full bg-white/5 border rounded-lg text-white placeholder-gray-400 
          focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent 
          transition-colors px-4 py-3 resize-none
          ${error ? 'border-red-500' : 'border-white/10'}
          ${className}
        `}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-400">{helperText}</p>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';