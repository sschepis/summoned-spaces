import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Tabs } from '../ui/Tabs';

interface FeedTab {
  id: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
}

interface FeedLayoutProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  composer?: ReactNode;
  sidebar?: ReactNode;
  sidebarPosition?: 'left' | 'right';
  children: ReactNode;
  tabs?: FeedTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  headerActions?: ReactNode;
  stickyHeader?: boolean;
  className?: string;
}

export function FeedLayout({ 
  title, 
  subtitle, 
  icon: Icon,
  composer, 
  sidebar,
  sidebarPosition = 'right',
  children,
  tabs,
  activeTab,
  onTabChange,
  headerActions,
  stickyHeader = true,
  className = '' 
}: FeedLayoutProps) {
  const headerClasses = stickyHeader 
    ? 'sticky top-0 z-10' 
    : '';

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar on left */}
        {sidebar && sidebarPosition === 'left' && (
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {sidebar}
            </div>
          </div>
        )}

        {/* Main Feed Column */}
        <div className={sidebar ? 'lg:col-span-2' : 'lg:col-span-3'}>
          {/* Feed Header */}
          <div className={`${headerClasses} bg-slate-900/80 backdrop-blur-xl border-b border-white/10 p-4 mb-6 rounded-xl`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {Icon && (
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-white">{title}</h1>
                  {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
                </div>
              </div>
              
              {headerActions && (
                <div className="flex items-center space-x-3">
                  {headerActions}
                </div>
              )}
            </div>

            {/* Tabs */}
            {tabs && onTabChange && (
              <Tabs
                tabs={tabs}
                activeTab={activeTab || tabs[0]?.id || ''}
                onTabChange={onTabChange}
                variant="default"
              />
            )}
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

        {/* Sidebar on right */}
        {sidebar && sidebarPosition === 'right' && (
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

// Feed layout presets
export const FeedLayoutPresets = {
  // Social feed with composer
  social: (props: Omit<FeedLayoutProps, 'stickyHeader'>) => (
    <FeedLayout {...props} stickyHeader />
  ),
  
  // Activity feed without composer
  activity: (props: Omit<FeedLayoutProps, 'composer'>) => (
    <FeedLayout {...props} composer={undefined} />
  ),
  
  // Full width feed (no sidebar)
  full: (props: Omit<FeedLayoutProps, 'sidebar'>) => (
    <FeedLayout {...props} sidebar={undefined} />
  )
};

// Common feed sidebars
export function TrendingSidebar({ 
  items,
  title = "Trending"
}: { 
  items: Array<{ id: string; label: string; count?: number }>;
  title?: string;
}) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <span className="text-gray-300 hover:text-white cursor-pointer transition-colors">
              {item.label}
            </span>
            {item.count && (
              <span className="text-sm text-gray-500">{item.count}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SuggestedUsersSidebar({ 
  users,
  onFollow,
  title = "Suggested for you"
}: { 
  users: Array<{ id: string; name: string; username: string; avatar?: string }>;
  onFollow: (userId: string) => void;
  title?: string;
}) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {user.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <div className="text-sm font-medium text-white">{user.name}</div>
                <div className="text-xs text-gray-400">{user.username}</div>
              </div>
            </div>
            <button
              onClick={() => onFollow(user.id)}
              className="px-3 py-1 text-xs bg-cyan-500/20 text-cyan-300 rounded-full 
                       hover:bg-cyan-500/30 transition-colors"
            >
              Follow
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}