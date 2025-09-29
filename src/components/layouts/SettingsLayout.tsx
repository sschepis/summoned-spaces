import { ReactNode } from 'react';
import { LucideIcon, ChevronRight } from 'lucide-react';
import { PageHeader } from '../ui/PageHeader';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface SettingsTab {
  id: string;
  label: string;
  icon: LucideIcon;
  description?: string;
  badge?: string;
  badgeVariant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  disabled?: boolean;
}

interface SettingsLayoutProps {
  title: string;
  subtitle?: string;
  tabs: SettingsTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onBack?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  children: ReactNode;
  saveLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  hasChanges?: boolean;
  sidebarWidth?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SettingsLayout({ 
  title, 
  subtitle, 
  tabs, 
  activeTab, 
  onTabChange, 
  onBack, 
  onSave,
  onCancel,
  children,
  saveLabel = 'Save Changes',
  cancelLabel = 'Cancel',
  loading = false,
  hasChanges = false,
  sidebarWidth = 'md',
  className = '' 
}: SettingsLayoutProps) {
  const sidebarWidthClasses = {
    sm: 'w-48',
    md: 'w-64',
    lg: 'w-80'
  };

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      <PageHeader title={title} subtitle={subtitle} onBack={onBack} />

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden mt-8">
        <div className="flex h-[700px]">
          {/* Sidebar Navigation */}
          <div className={`${sidebarWidthClasses[sidebarWidth]} border-r border-white/10 bg-slate-900/50`}>
            <nav className="p-4 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => !tab.disabled && onTabChange(tab.id)}
                  disabled={tab.disabled}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left 
                           transition-colors group ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : tab.disabled
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <tab.icon className="w-4 h-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="truncate">{tab.label}</span>
                        {tab.badge && (
                          <Badge 
                            variant={tab.badgeVariant || 'default'} 
                            size="sm"
                          >
                            {tab.badge}
                          </Badge>
                        )}
                      </div>
                      {tab.description && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {tab.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${
                    activeTab === tab.id ? 'text-cyan-300' : 'text-gray-600'
                  } ${!tab.disabled && 'group-hover:translate-x-0.5'}`} />
                </button>
              ))}
            </nav>

            {/* Settings Info */}
            <div className="p-4 border-t border-white/10">
              <div className="text-xs text-gray-500">
                <div className="flex items-center justify-between mb-2">
                  <span>Settings Version</span>
                  <span className="text-gray-400">2.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Updated</span>
                  <span className="text-gray-400">2 days ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Content Header */}
            {activeTabData && (
              <div className="px-6 py-4 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <activeTabData.icon className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-xl font-semibold text-white">
                    {activeTabData.label}
                  </h2>
                </div>
                {activeTabData.description && (
                  <p className="text-sm text-gray-400 mt-1">
                    {activeTabData.description}
                  </p>
                )}
              </div>
            )}

            {/* Scrollable Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {children}
            </div>

            {/* Footer Actions */}
            {(onSave || onCancel) && (
              <div className="flex items-center justify-between p-6 border-t border-white/10 bg-slate-900/50">
                <div className="text-sm text-gray-400">
                  {hasChanges && (
                    <span className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                      <span>You have unsaved changes</span>
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  {onCancel && (
                    <Button 
                      variant="ghost" 
                      onClick={onCancel}
                      disabled={loading}
                    >
                      {cancelLabel}
                    </Button>
                  )}
                  {onSave && (
                    <Button 
                      variant="primary" 
                      onClick={onSave}
                      loading={loading}
                      disabled={loading || !hasChanges}
                    >
                      {saveLabel}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings layout presets
export const SettingsLayoutPresets = {
  // User settings
  user: (props: Omit<SettingsLayoutProps, 'sidebarWidth'>) => (
    <SettingsLayout {...props} sidebarWidth="md" />
  ),
  
  // Admin settings with wider sidebar
  admin: (props: Omit<SettingsLayoutProps, 'sidebarWidth'>) => (
    <SettingsLayout {...props} sidebarWidth="lg" />
  ),
  
  // Compact settings
  compact: (props: Omit<SettingsLayoutProps, 'sidebarWidth'>) => (
    <SettingsLayout {...props} sidebarWidth="sm" />
  )
};

// Common settings sections
export function SettingsGroup({ 
  title, 
  description,
  children,
  className = ''
}: { 
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-8 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-400 mb-4">{description}</p>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}