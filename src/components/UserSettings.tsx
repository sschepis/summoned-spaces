import { useState, useEffect } from 'react';
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
import { useAuth } from '../contexts/AuthContext';

interface UserSettingsProps {
  onBack: () => void;
}


export function UserSettings({ onBack }: UserSettingsProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize with empty states
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    username: '',
    email: '',
    bio: '',
    avatar: '',
    location: '',
    website: ''
  });
  
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'public',
    allowFollowRequests: true,
    showResonanceStats: true,
    showSpaceMemberships: true,
    allowDirectMessages: 'followers'
  });
  
  const [resonance, setResonance] = useState<ResonanceSettings>({
    primeComplexity: 64,
    quantizationLevel: 128,
    autoOptimize: true,
    enablePredictiveLocking: true,
    maxConcurrentSummons: 5
  });
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    summonComplete: true,
    resonanceLock: true,
    newFollowers: true,
    spaceMentions: true,
    fileComments: false,
    weeklyDigest: true,
    pushEnabled: true
  });
  
  const [theme, setTheme] = useState<'dark' | 'light' | 'auto'>('dark');

  // Load user settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Load user profile and settings from API
        const response = await fetch(`/api/users/${user.id}/settings`);
        if (response.ok) {
          const data = await response.json();
          
          // Update profile with API data
          setProfile({
            name: data.profile?.name || user.name || '',
            username: data.profile?.username || user.username || '',
            email: data.profile?.email || '',
            bio: data.profile?.bio || '',
            avatar: data.profile?.avatar || `/api/avatar/${user.id}`,
            location: data.profile?.location || '',
            website: data.profile?.website || ''
          });
          
          // Update other settings if available
          if (data.privacy) setPrivacy(data.privacy);
          if (data.resonance) setResonance(data.resonance);
          if (data.notifications) setNotifications(data.notifications);
          if (data.theme) setTheme(data.theme);
        } else {
          // Use defaults from auth context
          setProfile({
            name: user.name || '',
            username: user.username || '',
            email: '',
            bio: '',
            avatar: `/api/avatar/${user.id}`,
            location: '',
            website: ''
          });
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
        setError('Failed to load settings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'resonance', label: 'Resonance', icon: Zap },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data & Export', icon: Database },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'danger', label: 'Account', icon: AlertTriangle }
  ];

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/users/${user.id}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile,
          privacy,
          resonance,
          notifications,
          theme
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      // Show success notification (you might want to add a toast component)
      console.log('Settings saved successfully');
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
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
      onTabChange={(tab) => setActiveTab(tab as string)}
      onBack={onBack}
      onSave={handleSave}
      saveLabel={saving ? "Saving..." : "Save Changes"}
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
          <p className="text-red-400">{error}</p>
        </div>
      ) : (
        renderTabContent()
      )}
    </SettingsLayout>
  );
}