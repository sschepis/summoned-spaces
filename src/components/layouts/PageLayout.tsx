import { ReactNode } from 'react';
import { PageHeader } from '../ui/PageHeader';
import { Breadcrumb } from '../ui/navigation/Breadcrumb';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  header?: ReactNode;
  sidebar?: ReactNode;
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: 'sm' | 'md' | 'lg';
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: ReactNode;
  fullWidth?: boolean;
  noPadding?: boolean;
  className?: string;
  onBack?: () => void;
}

export function PageLayout({ 
  children, 
  title,
  subtitle,
  header,
  sidebar, 
  sidebarPosition = 'right',
  sidebarWidth = 'md',
  breadcrumbs,
  actions,
  fullWidth = false,
  noPadding = false,
  className = '',
  onBack
}: PageLayoutProps) {
  const sidebarWidthClasses = {
    sm: 'lg:w-64',
    md: 'lg:w-80',
    lg: 'lg:w-96'
  };

  const containerClasses = fullWidth 
    ? 'w-full' 
    : 'max-w-7xl mx-auto';

  const paddingClasses = noPadding 
    ? '' 
    : 'px-4 sm:px-6 lg:px-8 py-8';

  // Render header section if any header props are provided
  const renderHeader = () => {
    if (!title && !subtitle && !breadcrumbs && !header) return null;

    return (
      <div className="mb-8">
        {breadcrumbs && (
          <Breadcrumb items={breadcrumbs} className="mb-4" />
        )}
        
        {(title || subtitle || actions) && (
          <div className="flex items-center justify-between">
            {(title || subtitle) && (
              <PageHeader
                title={title || ''}
                subtitle={subtitle}
                onBack={onBack}
              />
            )}
            {actions && (
              <div className="flex items-center space-x-3">
                {actions}
              </div>
            )}
          </div>
        )}
        
        {header}
      </div>
    );
  };

  // No sidebar layout
  if (!sidebar) {
    return (
      <div className={`${containerClasses} ${paddingClasses} ${className}`}>
        {renderHeader()}
        {children}
      </div>
    );
  }

  // With sidebar layout
  return (
    <div className={`${containerClasses} ${paddingClasses} ${className}`}>
      {renderHeader()}
      
      <div className="flex flex-col lg:flex-row gap-8">
        {sidebarPosition === 'left' && (
          <aside className={`${sidebarWidthClasses[sidebarWidth]} flex-shrink-0`}>
            <div className="sticky top-8">
              {sidebar}
            </div>
          </aside>
        )}
        
        <main className="flex-1 min-w-0">
          {children}
        </main>
        
        {sidebarPosition === 'right' && (
          <aside className={`${sidebarWidthClasses[sidebarWidth]} flex-shrink-0`}>
            <div className="sticky top-8">
              {sidebar}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

// Preset layouts for common patterns
export const PageLayoutPresets = {
  // Settings page layout
  settings: (props: Omit<PageLayoutProps, 'sidebarPosition' | 'sidebarWidth'>) => (
    <PageLayout {...props} sidebarPosition="left" sidebarWidth="sm" />
  ),
  
  // Content page with sidebar
  content: (props: PageLayoutProps) => (
    <PageLayout {...props} sidebarPosition="right" sidebarWidth="md" />
  ),
  
  // Full width layout (no max width constraint)
  full: (props: Omit<PageLayoutProps, 'fullWidth'>) => (
    <PageLayout {...props} fullWidth />
  ),
  
  // Minimal layout (no padding)
  minimal: (props: Omit<PageLayoutProps, 'noPadding'>) => (
    <PageLayout {...props} noPadding />
  )
};