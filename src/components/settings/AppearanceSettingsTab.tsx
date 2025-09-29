import { SettingsSection } from '../common/forms/SettingsSection';

interface AppearanceSettingsTabProps {
  theme: 'dark' | 'light' | 'auto';
  onThemeChange: (theme: 'dark' | 'light' | 'auto') => void;
}

export function AppearanceSettingsTab({ theme, onThemeChange }: AppearanceSettingsTabProps) {
  const themeOptions = [
    { id: 'dark', label: 'Dark', desc: 'Dark theme optimized for quantum interfaces' },
    { id: 'light', label: 'Light', desc: 'Light theme for daytime use' },
    { id: 'auto', label: 'Auto', desc: 'Follow your system preference' }
  ];

  return (
    <SettingsSection
      title="Appearance Settings"
      description="Customize the look and feel of the application."
    >
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Theme
        </label>
        <div className="space-y-2">
          {themeOptions.map((themeOption) => (
            <label key={themeOption.id} className="flex items-center p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
              <input
                type="radio"
                name="theme"
                value={themeOption.id}
                checked={theme === themeOption.id}
                onChange={(e) => onThemeChange(e.target.value as any)}
                className="sr-only"
              />
              <div className="flex-1">
                <div className="text-white font-medium">{themeOption.label}</div>
                <div className="text-sm text-gray-400">{themeOption.desc}</div>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 ${theme === themeOption.id ? 'border-cyan-400 bg-cyan-400' : 'border-gray-500'}`} />
            </label>
          ))}
        </div>
      </div>
    </SettingsSection>
  );
}