import { Input } from '../Input';
import { LucideIcon } from 'lucide-react';

interface FormFieldProps {
  name: string;
  label?: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  icon?: LucideIcon;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  className?: string;
  autoComplete?: string;
}

export function FormField({
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  icon,
  placeholder,
  required = false,
  disabled = false,
  helperText,
  className = '',
  autoComplete
}: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        error={error}
        icon={icon}
        placeholder={placeholder}
        disabled={disabled}
        helperText={helperText}
        autoComplete={autoComplete}
      />
    </div>
  );
}