import { User, Upload } from 'lucide-react';
import { Input } from '../ui/Input';
import { UserAvatar } from '../ui/UserAvatar';
import { SettingsSection } from '../common/forms/SettingsSection';

export interface UserProfile {
  name: string;
  username: string;
  email: string;
  bio: string;
  avatar: string;
  location: string;
  website: string;
}

interface ProfileSettingsTabProps {
  profile: UserProfile;
  onProfileChange: (profile: UserProfile) => void;
}

export function ProfileSettingsTab({ profile, onProfileChange }: ProfileSettingsTabProps) {
  const handleChange = (field: keyof UserProfile, value: string) => {
    onProfileChange({ ...profile, [field]: value });
  };

  return (
    <SettingsSection
      title="Profile Information"
      description="Update your public profile information."
    >
      <div className="flex items-center space-x-6">
        <div className="relative">
          <UserAvatar src={profile.avatar} name={profile.name} size="xl" />
          <button className="absolute bottom-0 right-0 p-2 bg-cyan-500 text-white rounded-full hover:bg-cyan-600 transition-colors">
            <Upload className="w-3 h-3" />
          </button>
        </div>
        <div>
          <h4 className="text-white font-medium">Profile Photo</h4>
          <p className="text-sm text-gray-400">Click to upload a new avatar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Display Name"
          value={profile.name}
          onChange={(e) => handleChange('name', e.target.value)}
          icon={User}
        />
        <Input
          label="Username"
          value={profile.username}
          onChange={(e) => handleChange('username', e.target.value)}
          placeholder="your_quantum_handle"
        />
        <Input
          label="Email"
          type="email"
          value={profile.email}
          onChange={(e) => handleChange('email', e.target.value)}
          icon={User}
        />
        <Input
          label="Location"
          value={profile.location}
          onChange={(e) => handleChange('location', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
        <textarea
          placeholder="Tell others about yourself..."
          value={profile.bio}
          onChange={(e) => handleChange('bio', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>

      <Input
        label="Website"
        type="url"
        value={profile.website}
        onChange={(e) => handleChange('website', e.target.value)}
        placeholder="https://yourwebsite.com"
      />
    </SettingsSection>
  );
}