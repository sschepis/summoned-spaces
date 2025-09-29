import { ReactNode } from 'react';
import { Video as LucideIcon } from 'lucide-react';
import { PageHeader } from '../ui/PageHeader';
import { Tabs } from '../ui/Tabs';
import { Button } from '../ui/Button';

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface SettingsLayoutProps {
  title: string;
  subtitle?: string;
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onBack?: () => void;
  onSave?: () => void;
  children: ReactNode;
  saveLabel?: string;
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
  children,
  saveLabel = 'Save Changes',
  className = '' 
}: SettingsLayoutProps) {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      <PageHeader title={title} subtitle={subtitle} onBack={onBack} />

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
        <div className="flex h-[700px]">
          {/* Sidebar */}
          <div className="w-64 border-r border-white/10 bg-slate-900/50">
            <nav className="p-4 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {children}
          </div>
        </div>

        {/* Footer */}
        {onSave && (
          <div className="flex items-center justify-end p-6 border-t border-white/10 space-x-3">
            <Button variant="ghost" onClick={onBack}>
              Cancel
            </Button>
            <Button variant="primary" onClick={onSave}>
              {saveLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}