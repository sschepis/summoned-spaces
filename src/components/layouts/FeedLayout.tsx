import { ReactNode } from 'react';
import { Globe, User } from 'lucide-react';

interface FeedLayoutProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  composer?: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function FeedLayout({ 
  title, 
  subtitle, 
  icon: Icon = Globe,
  composer, 
  sidebar, 
  children,
  className = '' 
}: FeedLayoutProps) {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed Column */}
        <div className="lg:col-span-2">
          {/* Feed Header */}
          <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 p-4 mb-6 rounded-xl">
            <div className="flex items-center space-x-3">
              <Icon className="w-6 h-6 text-cyan-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">{title}</h1>
                {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
              </div>
            </div>
          </div>

          {/* Composer */}
          {composer && (
            <div className="mb-8">
              {composer}
            </div>
          )}

          {/* Feed Content */}
          {children}
        </div>

        {/* Sidebar */}
        {sidebar && (
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