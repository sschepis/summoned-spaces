import { useState } from 'react';
import { User, Shield, Zap, Bell, Database, Palette, AlertTriangle } from 'lucide-react';
import { SettingsLayout } from './layouts/SettingsLayout';
import {
  ProfileSettingsTab,
  PrivacySettingsTab,
  ResonanceSettingsTab,
  NotificationSettingsTab,
  DataSettingsTab,
  AppearanceSettingsTab,
  DangerZoneTab,
} from './settings';
import type {
  UserProfile,
  PrivacySettings,
  ResonanceSettings,
  NotificationSettings,
} from './settings';

interface UserSettingsProps {
  onBack: () => void;
}

const initialProfile: UserProfile = {
  name: 'Your Name',
  username: 'yourhandle',
  email: 'your.email@example.com',
  bio: 'Quantum enthusiast exploring the resonance of collaborative spaces',
  avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  location: 'San Francisco, CA',
  website: 'https://yourwebsite.com'
};

const initialPrivacy: PrivacySettings = {
  profileVisibility: 'public',
  allowFollowRequests: true,
  showResonanceStats: true,
  showSpaceMemberships: true,
  allowDirectMessages: 'followers'
};

const initialResonance: ResonanceSettings = {
  primeComplexity: 64,
  quantizationLevel: 128,
  autoOptimize: true,
  enablePredictiveLocking: true,
  maxConcurrentSummons: 5
};

const initialNotifications: NotificationSettings = {
  summonComplete: true,
  resonanceLock: true,
  newFollowers: true,
  spaceMentions: true,
  fileComments: false,
  weeklyDigest: true,
  pushEnabled: true
};

export function UserSettings({ onBack }: UserSettingsProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [privacy, setPrivacy] = useState<PrivacySettings>(initialPrivacy);
  const [resonance, setResonance] = useState<ResonanceSettings>(initialResonance);
  const [notifications, setNotifications] = useState<NotificationSettings>(initialNotifications);
  const [theme, setTheme] = useState<'dark' | 'light' | 'auto'>('dark');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'resonance', label: 'Resonance', icon: Zap },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data & Export', icon: Database },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'danger', label: 'Account', icon: AlertTriangle }
  ];

  const handleSave = () => {
    console.log('Saving settings:', { profile, privacy, resonance, notifications });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettingsTab profile={profile} onProfileChange={setProfile} />;
      case 'privacy':
        return <PrivacySettingsTab privacy={privacy} onPrivacyChange={setPrivacy} />;
      case 'resonance':
        return <ResonanceSettingsTab resonance={resonance} onResonanceChange={setResonance} />;
      case 'notifications':
        return <NotificationSettingsTab notifications={notifications} onNotificationsChange={setNotifications} />;
      case 'data':
        return <DataSettingsTab />;
      case 'appearance':
        return <AppearanceSettingsTab theme={theme} onThemeChange={setTheme} />;
      case 'danger':
        return <DangerZoneTab />;
      default:
        return null;
    }
  };

  return (
    <SettingsLayout
      title="Settings"
      subtitle="Manage your account and quantum preferences"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as any)}
      onBack={onBack}
      onSave={handleSave}
      saveLabel="Save Changes"
    >
      {renderTabContent()}
    </SettingsLayout>
  );
}