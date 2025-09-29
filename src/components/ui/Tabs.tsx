import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'pills';
}

export function Tabs({ tabs, activeTab, onTabChange, className = '', variant = 'default' }: TabsProps) {
  if (variant === 'pills') {
    return (
      <div className={`flex items-center space-x-2 bg-white/10 rounded-lg p-1 ${className}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            disabled={tab.disabled}
            className={`flex items-center space-x-2 px-4 py-2 text-sm rounded-lg transition-all duration-200 
                     disabled:opacity-50 disabled:cursor-not-allowed ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/20'
                : 'text-gray-400 hover:text-cyan-300 hover:bg-white/10'
            }`}
          >
            {tab.icon && <tab.icon className="w-4 h-4" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="text-xs opacity-75">({tab.count})</span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`border-b border-white/10 ${className}`}>
      <nav className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            disabled={tab.disabled}
            className={`flex items-center space-x-2 px-1 py-4 border-b-2 font-medium text-sm 
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              activeTab === tab.id
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            {tab.icon && <tab.icon className="w-4 h-4" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="text-xs opacity-75">({tab.count})</span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}