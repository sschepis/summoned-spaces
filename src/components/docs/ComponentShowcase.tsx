import { useState } from 'react';
import { Mail, Lock, User, Heart, MessageCircle, Share, Settings } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FormField } from '../ui/forms/FormField';
import { FormGroup } from '../ui/forms/FormGroup';
import { Alert } from '../ui/feedback/Alert';
import { Skeleton } from '../ui/feedback/Skeleton';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Tabs } from '../ui/Tabs';
import { UserProfileSection } from '../common/sections/UserProfileSection';
import { ActionBar } from '../common/sections/ActionBar';
import { TagList } from '../common/sections/TagList';
import { Pagination } from '../ui/navigation/Pagination';
import { SearchBox } from '../ui/SearchBox';
import { Stat } from '../ui/data-display/Stat';

export function ComponentShowcase() {
  const [activeTab, setActiveTab] = useState('ui');
  const [searchQuery, setSearchQuery] = useState('');
  
  const mockUser = {
    id: '1',
    name: 'Sarah Chen',
    username: '@sarahc',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    bio: 'Designer & developer building the next generation of user interfaces',
    verified: true
  };

  const tabs = [
    { id: 'ui', label: 'UI Components' },
    { id: 'forms', label: 'Form Components' },
    { id: 'feedback', label: 'Feedback' },
    { id: 'common', label: 'Common Patterns' },
    { id: 'examples', label: 'Usage Examples' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Component Library</h1>
        <p className="text-gray-400">Comprehensive showcase of all reusable components</p>
      </div>

      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="mb-8"
      />

      {activeTab === 'ui' && (
        <div className="space-y-8">
          <ComponentSection title="Buttons" description="Various button styles and states">
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="success">Success Button</Button>
              <Button variant="danger">Danger Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="primary" loading>Loading...</Button>
              <Button variant="primary" icon={Settings}>With Icon</Button>
            </div>
          </ComponentSection>

          <ComponentSection title="Badges" description="Labels and status indicators">
            <div className="flex flex-wrap gap-4">
              <Badge variant="default">Default</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="cyan">Cyan</Badge>
              <Badge variant="purple">Purple</Badge>
            </div>
          </ComponentSection>

          <ComponentSection title="Cards" description="Container components">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <h3 className="text-lg font-semibold text-white mb-2">Basic Card</h3>
                <p className="text-gray-400">Simple card with content</p>
              </Card>
              <Card hover gradient="from-blue-500 to-cyan-500">
                <h3 className="text-lg font-semibold text-white mb-2">Interactive Card</h3>
                <p className="text-gray-400">Card with hover effects and gradient</p>
              </Card>
            </div>
          </ComponentSection>

          <ComponentSection title="Stats" description="Metric displays">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Stat
                label="Total Users"
                value="12,345"
                change={{ value: "+12%", trend: "up" }}
              />
              <Stat
                label="Revenue"
                value="$45,678"
                change={{ value: "-3%", trend: "down" }}
              />
              <Stat
                label="Conversion Rate"
                value="3.24%"
                change={{ value: "0%", trend: "neutral" }}
              />
            </div>
          </ComponentSection>
        </div>
      )}

      {activeTab === 'forms' && (
        <div className="space-y-8">
          <ComponentSection title="Form Fields" description="Input components with validation">
            <div className="max-w-md space-y-4">
              <FormField
                name="email"
                label="Email Address"
                type="email"
                value=""
                onChange={() => {}}
                icon={Mail}
                placeholder="your@email.com"
                required
              />
              <FormField
                name="password"
                label="Password"
                type="password"
                value=""
                onChange={() => {}}
                icon={Lock}
                placeholder="••••••••"
                helperText="Must be at least 8 characters"
                required
              />
              <FormField
                name="error-example"
                label="Field with Error"
                value=""
                onChange={() => {}}
                error="This field is required"
                required
              />
            </div>
          </ComponentSection>

          <ComponentSection title="Search" description="Search components with features">
            <div className="max-w-md">
              <SearchBox
                value={searchQuery}
                onSearch={setSearchQuery}
                placeholder="Search components..."
                loading={false}
              />
            </div>
          </ComponentSection>
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="space-y-8">
          <ComponentSection title="Alerts" description="Notification messages">
            <div className="space-y-4">
              <Alert variant="info">
                This is an informational message with useful details.
              </Alert>
              <Alert variant="success" dismissible>
                Success! Your changes have been saved successfully.
              </Alert>
              <Alert variant="warning" title="Warning">
                Please review your settings before proceeding.
              </Alert>
              <Alert variant="error" title="Error" dismissible>
                Something went wrong. Please try again later.
              </Alert>
            </div>
          </ComponentSection>

          <ComponentSection title="Loading States" description="Skeleton loading components">
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton width="60%" height={20} />
                <Skeleton width="100%" height={16} />
                <Skeleton width="80%" height={16} />
              </div>
              <div className="flex items-center space-x-4">
                <Skeleton variant="circular" width={48} height={48} />
                <div className="flex-1 space-y-2">
                  <Skeleton width="40%" height={16} />
                  <Skeleton width="60%" height={14} />
                </div>
              </div>
            </div>
          </ComponentSection>
        </div>
      )}

      {activeTab === 'common' && (
        <div className="space-y-8">
          <ComponentSection title="User Profile" description="Reusable user display components">
            <div className="space-y-4">
              <UserProfileSection
                user={mockUser}
                size="md"
                showUsername
                showBio
              />
              <UserProfileSection
                user={mockUser}
                size="sm"
                orientation="horizontal"
                showUsername
              />
            </div>
          </ComponentSection>

          <ComponentSection title="Action Bar" description="Interactive action buttons">
            <ActionBar
              actions={['like', 'comment', 'share', 'bookmark']}
              metrics={{
                likes: 42,
                comments: 8,
                shares: 5,
                hasLiked: false,
                hasBookmarked: true
              }}
              onAction={(action) => console.log('Action:', action)}
            />
          </ComponentSection>

          <ComponentSection title="Tags" description="Tag list component">
            <TagList
              tags={['React', 'TypeScript', 'Design', 'Frontend', 'UI/UX']}
              max={3}
              onClick={(tag) => console.log('Tag clicked:', tag)}
            />
          </ComponentSection>

          <ComponentSection title="Pagination" description="Page navigation">
            <Pagination
              totalItems={100}
              itemsPerPage={10}
              currentPage={1}
              onPageChange={(page) => console.log('Page:', page)}
            />
          </ComponentSection>
        </div>
      )}

      {activeTab === 'examples' && (
        <div className="space-y-8">
          <ComponentSection title="Usage Examples" description="How to combine components">
            <div className="bg-slate-800/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Login Form Example</h3>
              <pre className="text-sm text-gray-300 overflow-x-auto">
{`<AuthFormLayout
  title="Welcome Back"
  subtitle="Enter the quantum realm"
  onSubmit={handleSubmit}
  loading={loading}
  error={error}
>
  <FormGroup>
    <FormField
      name="email"
      label="Email"
      type="email"
      value={email}
      onChange={handleChange}
      icon={Mail}
      required
    />
    <FormField
      name="password"
      label="Password"
      type="password"
      value={password}
      onChange={handleChange}
      icon={Lock}
      required
    />
  </FormGroup>
</AuthFormLayout>`}
              </pre>
            </div>
          </ComponentSection>
        </div>
      )}
    </div>
  );
}

function ComponentSection({ 
  title, 
  description, 
  children 
}: { 
  title: string; 
  description: string; 
  children: React.ReactNode; 
}) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white mb-1">{title}</h2>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      {children}
    </div>
  );
}