import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  gradient?: string;
  onClick?: () => void;
}

export function Card({ 
  children, 
  className = '', 
  hover = false, 
  padding = 'md',
  gradient,
  onClick 
}: CardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const baseClasses = `
    bg-white/5 backdrop-blur-sm rounded-xl border border-white/10
    ${hover ? 'hover:bg-white/10 transition-all duration-300' : ''}
    ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}
    ${paddingClasses[padding]}
  `;

  return (
    <div className={`${baseClasses} ${className}`} onClick={onClick}>
      {children}
      {gradient && (
        <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${gradient} 
                      opacity-60 group-hover:opacity-100 transition-opacity duration-300 
                      rounded-b-xl`} />
      )}
    </div>
  );
}