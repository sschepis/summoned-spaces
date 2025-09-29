import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { SpaceView } from './components/SpaceView';
import { SemanticSearch } from './components/SemanticSearch';
import { AnalyticsBoard } from './components/AnalyticsBoard';
import { DirectMessages } from './components/DirectMessages';
import { SocialNetwork } from './components/SocialNetwork';
import { NotificationSystem, useNotifications } from './components/NotificationSystem';
import { PersonalHomeFeed } from './components/PersonalHomeFeed';

export type View = 'feed' | 'dashboard' | 'space' | 'search' | 'analytics' | 'messages' | 'friends';

function App() {
  const [currentView, setCurrentView] = useState<View>('feed');
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const { notifications, dismissNotification, showSuccess, showResonance } = useNotifications();

  const handleViewSpace = (spaceId: string) => {
    setSelectedSpaceId(spaceId);
    setCurrentView('space');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'feed':
        return <PersonalHomeFeed />;
      case 'space':
        return <SpaceView spaceId={selectedSpaceId} onBack={() => setCurrentView('dashboard')} />;
      case 'friends':
        return <SocialNetwork onBack={() => setCurrentView('dashboard')} />;
      case 'messages':
        return <DirectMessages onBack={() => setCurrentView('dashboard')} />;
      case 'search':
        return <SemanticSearch onBack={() => setCurrentView('dashboard')} />;
      case 'analytics':
        return <AnalyticsBoard />;
      case 'dashboard':
        return <Dashboard onViewSpace={handleViewSpace} />;
      default:
        return <Dashboard onViewSpace={handleViewSpace} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2523ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <main className="relative">
        {renderCurrentView()}
      </main>
      <NotificationSystem 
        notifications={notifications} 
        onDismiss={dismissNotification} 
      />
    </div>
  );
}

export default App;