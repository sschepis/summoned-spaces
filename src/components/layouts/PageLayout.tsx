import { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PageLayout({ 
  children, 
  sidebar, 
  sidebarPosition = 'right',
  sidebarWidth = 'md',
  className = '' 
}: PageLayoutProps) {
  const sidebarWidthClasses = {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96'
  };

  if (!sidebar) {
    return (
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {sidebarPosition === 'left' && (
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {sidebar}
            </div>
          </div>
        )}
        
        <div className={sidebar ? 'lg:col-span-2' : 'lg:col-span-3'}>
          {children}
        </div>
        
        {sidebarPosition === 'right' && (
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {sidebar}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}