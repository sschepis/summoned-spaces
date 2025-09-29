import { Globe, User, Lock } from 'lucide-react';
import { SettingsSection } from '../common/forms/SettingsSection';
import { Toggle } from '../ui/Toggle';
import { Select } from '../ui/forms/Select';

export interface PrivacySettings {
  profileVisibility: 'public' | 'followers' | 'private';
  allowFollowRequests: boolean;
  showResonanceStats: boolean;
  showSpaceMemberships: boolean;
  allowDirectMessages: 'everyone' | 'followers' | 'none';
}

interface PrivacySettingsTabProps {
  privacy: PrivacySettings;
  onPrivacyChange: (privacy: PrivacySettings) => void;
}

export function PrivacySettingsTab({ privacy, onPrivacyChange }: PrivacySettingsTabProps) {
  const handleToggleChange = (field: keyof PrivacySettings, value: boolean) => {
    onPrivacyChange({ ...privacy, [field]: value });
  };

  const handleSelectChange = (field: keyof PrivacySettings, value: string) => {
    onPrivacyChange({ ...privacy, [field]: value });
  };

  const visibilityOptions = [
    { id: 'public', icon: Globe, label: 'Public', desc: 'Anyone can see your profile' },
    { id: 'followers', icon: User, label: 'Followers Only', desc: 'Only your followers can see your profile' },
    { id: 'private', icon: Lock, label: 'Private', desc: 'Only you can see your profile' }
  ];

  const toggleSettings = [
    { key: 'allowFollowRequests', label: 'Allow Follow Requests', description: 'Let others request to follow you' },
    { key: 'showResonanceStats', label: 'Show Resonance Statistics', description: 'Display your quantum performance metrics' },
    { key: 'showSpaceMemberships', label: 'Show Space Memberships', description: 'Display which spaces you belong to' }
  ];

  const dmOptions = [
    { value: 'everyone', label: 'Everyone' },
    { value: 'followers', label: 'Followers Only' },
    { value: 'none', label: 'No One' }
  ];

  return (
    <SettingsSection
      title="Privacy Settings"
      description="Control how your information is shared across the platform."
    >
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Profile Visibility
        </label>
        <div className="space-y-2">
          {visibilityOptions.map((option) => (
            <label key={option.id} className="flex items-center p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
              <input
                type="radio"
                name="profileVisibility"
                value={option.id}
                checked={privacy.profileVisibility === option.id}
                onChange={(e) => handleSelectChange('profileVisibility', e.target.value)}
                className="sr-only"
              />
              <option.icon className="w-5 h-5 text-cyan-400 mr-3" />
              <div className="flex-1">
                <div className="text-white font-medium">{option.label}</div>
                <div className="text-sm text-gray-400">{option.desc}</div>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 ${privacy.profileVisibility === option.id ? 'border-cyan-400 bg-cyan-400' : 'border-gray-500'}`} />
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {toggleSettings.map((setting) => (
          <div key={setting.key} className="p-4 bg-white/5 rounded-lg">
            <Toggle
              label={setting.label}
              description={setting.description}
              checked={privacy[setting.key as keyof PrivacySettings] as boolean}
              onChange={(checked) => handleToggleChange(setting.key as keyof PrivacySettings, checked)}
            />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Direct Messages
        </label>
        <Select
          value={privacy.allowDirectMessages}
          onChange={(e) => handleSelectChange('allowDirectMessages', e.target.value)}
          options={dmOptions}
        />
      </div>
    </SettingsSection>
  );
}