import { SettingsSection } from '../common/forms/SettingsSection';
import { Toggle } from '../ui/Toggle';

export interface NotificationSettings {
  summonComplete: boolean;
  resonanceLock: boolean;
  newFollowers: boolean;
  spaceMentions: boolean;
  fileComments: boolean;
  weeklyDigest: boolean;
  pushEnabled: boolean;
}

interface NotificationSettingsTabProps {
  notifications: NotificationSettings;
  onNotificationsChange: (notifications: NotificationSettings) => void;
}

export function NotificationSettingsTab({ notifications, onNotificationsChange }: NotificationSettingsTabProps) {
  const handleToggleChange = (field: keyof NotificationSettings, value: boolean) => {
    onNotificationsChange({ ...notifications, [field]: value });
  };

  const notificationSettings = [
    { key: 'summonComplete', label: 'Summon Complete', desc: 'When file summoning finishes successfully' },
    { key: 'resonanceLock', label: 'Resonance Lock Achieved', desc: 'When perfect resonance is achieved on your files' },
    { key: 'newFollowers', label: 'New Followers', desc: 'When someone starts following you' },
    { key: 'spaceMentions', label: 'Space Mentions', desc: 'When you\'re mentioned in spaces' },
    { key: 'fileComments', label: 'File Comments', desc: 'When someone comments on your files' },
    { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of your weekly activity' }
  ];

  return (
    <SettingsSection
      title="Notification Preferences"
      description="Choose which notifications you want to receive."
    >
      <div className="space-y-4">
        {notificationSettings.map((setting) => (
          <div key={setting.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <h4 className="font-medium text-white">{setting.label}</h4>
              <p className="text-sm text-gray-400">{setting.desc}</p>
            </div>
            <Toggle
              checked={notifications[setting.key as keyof NotificationSettings]}
              onChange={(checked) => handleToggleChange(setting.key as keyof NotificationSettings, checked)}
            />
          </div>
        ))}

        <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg border border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Push Notifications</h4>
              <p className="text-sm text-gray-400">Enable browser push notifications</p>
            </div>
            <Toggle
              checked={notifications.pushEnabled}
              onChange={(checked) => handleToggleChange('pushEnabled', checked)}
            />
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}