import { useState } from 'react';
import { ArrowLeft, User, Shield, Zap, Bell, Database, Palette, Download, Upload, Globe, Lock, Eye, EyeOff, Save, Trash2, AlertTriangle } from 'lucide-react';

interface UserSettingsProps {
  onBack: () => void;
}

interface UserProfile {
  name: string;
  username: string;
  email: string;
  bio: string;
  avatar: string;
  location: string;
  website: string;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'followers' | 'private';
  allowFollowRequests: boolean;
  showResonanceStats: boolean;
  showSpaceMemberships: boolean;
  allowDirectMessages: 'everyone' | 'followers' | 'none';
}

interface ResonanceSettings {
  primeComplexity: number;
  quantizationLevel: number;
  autoOptimize: boolean;
  enablePredictiveLocking: boolean;
  maxConcurrentSummons: number;
}

interface NotificationSettings {
  summonComplete: boolean;
  resonanceLock: boolean;
  newFollowers: boolean;
  spaceMentions: boolean;
  fileComments: boolean;
  weeklyDigest: boolean;
  pushEnabled: boolean;
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
  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'resonance' | 'notifications' | 'data' | 'appearance' | 'danger'>('profile');
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [privacy, setPrivacy] = useState<PrivacySettings>(initialPrivacy);
  const [resonance, setResonance] = useState<ResonanceSettings>(initialResonance);
  const [notifications, setNotifications] = useState<NotificationSettings>(initialNotifications);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
    // Save settings
    console.log('Saving settings:', { profile, privacy, resonance, notifications });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account and quantum preferences</p>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
        <div className="flex h-[700px]">
          {/* Sidebar */}
          <div className="w-64 border-r border-white/10 bg-slate-900/50">
            <nav className="p-4 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
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
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <img
                          src={profile.avatar}
                          alt="Profile"
                          className="w-20 h-20 rounded-full object-cover border-2 border-white/10"
                        />
                        <button className="absolute bottom-0 right-0 p-2 bg-cyan-500 text-white rounded-full 
                                       hover:bg-cyan-600 transition-colors">
                          <Upload className="w-3 h-3" />
                        </button>
                      </div>
                      <div>
                        <h4 className="text-white font-medium">Profile Photo</h4>
                        <p className="text-sm text-gray-400">Click to upload a new avatar</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white 
                                   placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 
                                   focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Username
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={profile.username}
                            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                            className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white 
                                     placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 
                                     focus:border-transparent"
                          />
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">@</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white 
                                   placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 
                                   focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={profile.location}
                          onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white 
                                   placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 
                                   focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white 
                                 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 
                                 focus:border-transparent"
                        placeholder="Tell others about yourself..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={profile.website}
                        onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white 
                                 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 
                                 focus:border-transparent"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Privacy Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Profile Visibility
                      </label>
                      <div className="space-y-2">
                        {[
                          { id: 'public', icon: Globe, label: 'Public', desc: 'Anyone can see your profile' },
                          { id: 'followers', icon: User, label: 'Followers Only', desc: 'Only your followers can see your profile' },
                          { id: 'private', icon: Lock, label: 'Private', desc: 'Only you can see your profile' }
                        ].map((option) => (
                          <label key={option.id} className="flex items-center p-3 bg-white/5 rounded-lg border 
                                                         border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                            <input
                              type="radio"
                              name="profileVisibility"
                              value={option.id}
                              checked={privacy.profileVisibility === option.id}
                              onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value as any })}
                              className="sr-only"
                            />
                            <option.icon className="w-5 h-5 text-cyan-400 mr-3" />
                            <div className="flex-1">
                              <div className="text-white font-medium">{option.label}</div>
                              <div className="text-sm text-gray-400">{option.desc}</div>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              privacy.profileVisibility === option.id ? 'border-cyan-400 bg-cyan-400' : 'border-gray-500'
                            }`} />
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        { key: 'allowFollowRequests', label: 'Allow Follow Requests', desc: 'Let others request to follow you' },
                        { key: 'showResonanceStats', label: 'Show Resonance Statistics', desc: 'Display your quantum performance metrics' },
                        { key: 'showSpaceMemberships', label: 'Show Space Memberships', desc: 'Display which spaces you belong to' }
                      ].map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                          <div>
                            <h4 className="font-medium text-white">{setting.label}</h4>
                            <p className="text-sm text-gray-400">{setting.desc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={privacy[setting.key as keyof PrivacySettings] as boolean}
                              onChange={(e) => setPrivacy({ ...privacy, [setting.key]: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer 
                                          peer-checked:after:translate-x-full peer-checked:after:border-white 
                                          after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                          after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all 
                                          peer-checked:bg-cyan-500"></div>
                          </label>
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Direct Messages
                      </label>
                      <select
                        value={privacy.allowDirectMessages}
                        onChange={(e) => setPrivacy({ ...privacy, allowDirectMessages: e.target.value as any })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white 
                                 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      >
                        <option value="everyone" className="bg-slate-800">Everyone</option>
                        <option value="followers" className="bg-slate-800">Followers Only</option>
                        <option value="none" className="bg-slate-800">No One</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'resonance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Quantum Resonance Settings</h3>
                  <p className="text-sm text-gray-400 mb-6">
                    Advanced parameters for file encoding and reconstruction performance
                  </p>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Prime Complexity Level ({resonance.primeComplexity})
                      </label>
                      <input
                        type="range"
                        min="16"
                        max="256"
                        value={resonance.primeComplexity}
                        onChange={(e) => setResonance({ ...resonance, primeComplexity: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Higher values increase security but require more computation
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Quantization Level ({resonance.quantizationLevel})
                      </label>
                      <input
                        type="range"
                        min="32"
                        max="512"
                        value={resonance.quantizationLevel}
                        onChange={(e) => setResonance({ ...resonance, quantizationLevel: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Affects reconstruction precision and beacon efficiency
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Max Concurrent Summons ({resonance.maxConcurrentSummons})
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={resonance.maxConcurrentSummons}
                        onChange={(e) => setResonance({ ...resonance, maxConcurrentSummons: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Number of files you can summon simultaneously
                      </p>
                    </div>

                    <div className="space-y-4">
                      {[
                        { key: 'autoOptimize', label: 'Auto-Optimize Parameters', desc: 'Automatically adjust settings for best performance' },
                        { key: 'enablePredictiveLocking', label: 'Predictive Resonance Locking', desc: 'Pre-compute likely summon requests for faster access' }
                      ].map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                          <div>
                            <h4 className="font-medium text-white">{setting.label}</h4>
                            <p className="text-sm text-gray-400">{setting.desc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={resonance[setting.key as keyof ResonanceSettings] as boolean}
                              onChange={(e) => setResonance({ ...resonance, [setting.key]: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer 
                                          peer-checked:after:translate-x-full peer-checked:after:border-white 
                                          after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                          after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all 
                                          peer-checked:bg-cyan-500"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'summonComplete', label: 'Summon Complete', desc: 'When file summoning finishes successfully' },
                      { key: 'resonanceLock', label: 'Resonance Lock Achieved', desc: 'When perfect resonance is achieved on your files' },
                      { key: 'newFollowers', label: 'New Followers', desc: 'When someone starts following you' },
                      { key: 'spaceMentions', label: 'Space Mentions', desc: 'When you\'re mentioned in spaces' },
                      { key: 'fileComments', label: 'File Comments', desc: 'When someone comments on your files' },
                      { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of your weekly activity' }
                    ].map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <h4 className="font-medium text-white">{setting.label}</h4>
                          <p className="text-sm text-gray-400">{setting.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications[setting.key as keyof NotificationSettings] as boolean}
                            onChange={(e) => setNotifications({ ...notifications, [setting.key]: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer 
                                        peer-checked:after:translate-x-full peer-checked:after:border-white 
                                        after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                        after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all 
                                        peer-checked:bg-cyan-500"></div>
                        </label>
                      </div>
                    ))}

                    <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg border border-cyan-500/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">Push Notifications</h4>
                          <p className="text-sm text-gray-400">Enable browser push notifications</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.pushEnabled}
                            onChange={(e) => setNotifications({ ...notifications, pushEnabled: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer 
                                        peer-checked:after:translate-x-full peer-checked:after:border-white 
                                        after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                        after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all 
                                        peer-checked:bg-cyan-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Data Management</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">Export Your Data</h4>
                          <p className="text-sm text-gray-400">Download all your spaces, files, and resonance data</p>
                        </div>
                        <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm 
                                       rounded-lg transition-colors flex items-center space-x-2">
                          <Download className="w-4 h-4" />
                          <span>Export</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">Import Data</h4>
                          <p className="text-sm text-gray-400">Import spaces and files from other platforms</p>
                        </div>
                        <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm 
                                       rounded-lg transition-colors flex items-center space-x-2">
                          <Upload className="w-4 h-4" />
                          <span>Import</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <h4 className="font-medium text-blue-300 mb-2">Storage Usage</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Files contributed:</span>
                          <span className="text-white">2.4 GB</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Resonance cache:</span>
                          <span className="text-white">156 MB</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Total used:</span>
                          <span className="text-cyan-400 font-medium">2.56 GB of 10 GB</span>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full" 
                                 style={{ width: '25.6%' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Appearance Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Theme
                      </label>
                      <div className="space-y-2">
                        {[
                          { id: 'dark', label: 'Dark', desc: 'Dark theme optimized for quantum interfaces' },
                          { id: 'light', label: 'Light', desc: 'Light theme for daytime use' },
                          { id: 'auto', label: 'Auto', desc: 'Follow your system preference' }
                        ].map((themeOption) => (
                          <label key={themeOption.id} className="flex items-center p-3 bg-white/5 rounded-lg border 
                                                               border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                            <input
                              type="radio"
                              name="theme"
                              value={themeOption.id}
                              checked={theme === themeOption.id}
                              onChange={(e) => setTheme(e.target.value as any)}
                              className="sr-only"
                            />
                            <div className="flex-1">
                              <div className="text-white font-medium">{themeOption.label}</div>
                              <div className="text-sm text-gray-400">{themeOption.desc}</div>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              theme === themeOption.id ? 'border-cyan-400 bg-cyan-400' : 'border-gray-500'
                            }`} />
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'danger' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-red-400 mb-4">Account Management</h3>
                  <p className="text-sm text-gray-400 mb-6">
                    Manage your account and data with caution
                  </p>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-yellow-300 mb-2">Clear Resonance Cache</h4>
                          <p className="text-sm text-gray-400 mb-4">
                            Clear all cached resonance data. This will slow down future summons but free up space.
                          </p>
                          <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm 
                                         rounded-lg transition-colors">
                            Clear Cache
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Trash2 className="w-5 h-5 text-red-400 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-red-300 mb-2">Delete Account</h4>
                          <p className="text-sm text-gray-400 mb-4">
                            Permanently delete your account and all associated data. This action cannot be undone.
                          </p>
                          <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm 
                                     rounded-lg transition-colors"
                          >
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>

                    {showDeleteConfirm && (
                      <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                        <h4 className="font-medium text-red-300 mb-2">Are you absolutely sure?</h4>
                        <p className="text-sm text-gray-400 mb-4">
                          Type <strong>DELETE MY ACCOUNT</strong> to confirm permanent deletion.
                        </p>
                        <div className="flex items-center space-x-3">
                          <input
                            type="text"
                            placeholder="Type DELETE MY ACCOUNT"
                            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg 
                                     text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
                          >
                            Cancel
                          </button>
                          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm 
                                         rounded-lg transition-colors">
                            Confirm Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-white/10 space-x-3">
          <button
            onClick={onBack}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white 
                     rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all 
                     duration-200 font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
}