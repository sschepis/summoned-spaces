import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}

export function SettingsSection({ 
  title, 
  description, 
  icon: Icon,
  children,
  className = '' 
}: SettingsSectionProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-start space-x-3">
        {Icon && (
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 
                        rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-cyan-400" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
          {description && (
            <p className="text-sm text-gray-400">{description}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

// Settings item wrapper for consistent spacing
interface SettingsItemProps {
  children: ReactNode;
  className?: string;
}

export function SettingsItem({ children, className = '' }: SettingsItemProps) {
  return (
    <div className={`p-4 bg-white/5 rounded-lg border border-white/10 ${className}`}>
      {children}
    </div>
  );
}