import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface SearchResultsSectionProps {
  title: string;
  icon: LucideIcon;
  count: number;
  children: ReactNode;
  className?: string;
}

export function SearchResultsSection({
  title,
  icon: Icon,
  count,
  children,
  className = ''
}: SearchResultsSectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
        <Icon className="w-5 h-5 text-cyan-400" />
        <span>{title} ({count})</span>
      </h3>
      {children}
    </div>
  );
}