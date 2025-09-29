import { SettingsSection } from '../common/forms/SettingsSection';
import { Toggle } from '../ui/Toggle';

export interface ResonanceSettings {
  primeComplexity: number;
  quantizationLevel: number;
  autoOptimize: boolean;
  enablePredictiveLocking: boolean;
  maxConcurrentSummons: number;
}

interface ResonanceSettingsTabProps {
  resonance: ResonanceSettings;
  onResonanceChange: (resonance: ResonanceSettings) => void;
}

export function ResonanceSettingsTab({ resonance, onResonanceChange }: ResonanceSettingsTabProps) {
  const handleRangeChange = (field: keyof ResonanceSettings, value: string) => {
    onResonanceChange({ ...resonance, [field]: parseInt(value) });
  };

  const handleToggleChange = (field: keyof ResonanceSettings, value: boolean) => {
    onResonanceChange({ ...resonance, [field]: value });
  };

  const rangeSettings = [
    { key: 'primeComplexity', label: 'Prime Complexity Level', min: 16, max: 256, description: 'Higher values increase security but require more computation' },
    { key: 'quantizationLevel', label: 'Quantization Level', min: 32, max: 512, description: 'Affects reconstruction precision and beacon efficiency' },
    { key: 'maxConcurrentSummons', label: 'Max Concurrent Summons', min: 1, max: 20, description: 'Number of files you can summon simultaneously' },
  ];

  const toggleSettings = [
    { key: 'autoOptimize', label: 'Auto-Optimize Parameters', desc: 'Automatically adjust settings for best performance' },
    { key: 'enablePredictiveLocking', label: 'Predictive Resonance Locking', desc: 'Pre-compute likely summon requests for faster access' }
  ];

  return (
    <SettingsSection
      title="Quantum Resonance Settings"
      description="Advanced parameters for file encoding and reconstruction performance."
    >
      {rangeSettings.map(setting => (
        <div key={setting.key}>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {setting.label} ({resonance[setting.key as keyof ResonanceSettings]})
          </label>
          <input
            type="range"
            min={setting.min}
            max={setting.max}
            value={resonance[setting.key as keyof ResonanceSettings] as number}
            onChange={(e) => handleRangeChange(setting.key as keyof ResonanceSettings, e.target.value)}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <p className="text-xs text-gray-400 mt-1">
            {setting.description}
          </p>
        </div>
      ))}

      <div className="space-y-4">
        {toggleSettings.map((setting) => (
          <div key={setting.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <h4 className="font-medium text-white">{setting.label}</h4>
              <p className="text-sm text-gray-400">{setting.desc}</p>
            </div>
            <Toggle
              checked={resonance[setting.key as keyof ResonanceSettings] as boolean}
              onChange={(checked) => handleToggleChange(setting.key as keyof ResonanceSettings, checked)}
            />
          </div>
        ))}
      </div>
    </SettingsSection>
  );
}