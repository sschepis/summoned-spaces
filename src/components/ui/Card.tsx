import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient' | 'primary';
  onClick?: () => void;
}

export function Card({
  children,
  className = '',
  hover = false,
  padding = 'md',
  variant = 'default',
  onClick
}: CardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const variantClasses = {
    default: 'glass',
    gradient: 'glass card-gradient',
    primary: 'glass primary-gradient'
  };

  const baseClasses = `
    rounded-xl ${variantClasses[variant]} ${paddingClasses[padding]}
    ${hover ? 'glass-hover' : ''}
    ${onClick ? 'cursor-pointer' : ''}
  `;

  return (
    <div className={`${baseClasses} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}