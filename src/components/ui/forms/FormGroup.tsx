import { ReactNode } from 'react';

interface FormGroupProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function FormGroup({ 
  children, 
  title, 
  description, 
  className = '' 
}: FormGroupProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-gray-400">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}