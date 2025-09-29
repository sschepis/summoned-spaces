import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ForgotPassword } from './components/ForgotPassword';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { SpaceView } from './components/SpaceView';
import { SemanticSearch } from './components/SemanticSearch';
import { AnalyticsBoard } from './components/AnalyticsBoard';
import { DirectMessages } from './components/DirectMessages';
import { SocialNetwork } from './components/SocialNetwork';
import { NotificationSystem, useNotifications } from './components/NotificationSystem';
import { PublicActivityStream } from './components/PublicActivityStream';
import { UserSettings } from './components/UserSettings';
import { SystemAdmin } from './components/SystemAdmin';
import { ContentAdmin } from './components/ContentAdmin';

type View =
  | 'feed'
  | 'space'
  | 'friends'
  | 'messages'
  | 'search'
  | 'analytics'
  | 'dashboard'
  | 'settings'
  | 'system-admin'
  | 'content-admin';

// Authentication views component
const AuthViews: React.FC = () => {
  const [authView, setAuthView] = React.useState<'login' | 'register' | 'forgot-password'>('login');
  const { error, clearError } = useAuth();
  const { showSuccess } = useNotifications();

  const handleLoginSuccess = React.useCallback(() => {
    showSuccess('Welcome back!', 'You have successfully entered the quantum realm');
  }, [showSuccess]);

  const handleRegisterSuccess = React.useCallback(() => {
    showSuccess('Account created!', 'Your quantum identity has been established');
  }, [showSuccess]);

  React.useEffect(() => {
    if (error) {
      // Auto-clear errors after 5 seconds
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  switch (authView) {
    case 'register':
      return (
        <Register
          onSwitchToLogin={() => setAuthView('login')}
          onRegisterSuccess={handleRegisterSuccess}
        />
      );
    case 'forgot-password':
      return (
        <ForgotPassword
          onBack={() => setAuthView('login')}
          onBackToLogin={() => setAuthView('login')}
        />
      );
    default:
      return (
        <Login
          onSwitchToRegister={() => setAuthView('register')}
          onSwitchToForgotPassword={() => setAuthView('forgot-password')}
          onLoginSuccess={handleLoginSuccess}
        />
      );
  }
};

// Main application views component
const AppViews: React.FC = () => {
  const [currentView, setCurrentView] = React.useState<View>('dashboard');
  const [selectedSpaceId, setSelectedSpaceId] = React.useState<string | null>(null);
  const { logout } = useAuth();
  const { notifications, dismissNotification } = useNotifications();

  const handleViewSpace = React.useCallback((spaceId: string) => {
    setSelectedSpaceId(spaceId);
    setCurrentView('space');
  }, []);

  const handleLogout = React.useCallback(() => {
    logout();
    setCurrentView('feed');
  }, [logout]);

  const renderCurrentView = React.useCallback(() => {
    switch (currentView) {
      case 'feed':
        return <PublicActivityStream />;
      case 'space':
        return (
          <SpaceView
            spaceId={selectedSpaceId}
            onBack={() => setCurrentView('dashboard')}
          />
        );
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
      case 'settings':
        return <UserSettings onBack={() => setCurrentView('dashboard')} />;
      case 'system-admin':
        return <SystemAdmin onBack={() => setCurrentView('dashboard')} />;
      case 'content-admin':
        return <ContentAdmin onBack={() => setCurrentView('dashboard')} />;
      default:
        return <Dashboard onViewSpace={handleViewSpace} />;
    }
  }, [currentView, selectedSpaceId, handleViewSpace]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2523ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>
      
      <Navigation 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        onLogout={handleLogout} 
      />
      
      <main className="relative">
        {renderCurrentView()}
      </main>
      
      <NotificationSystem 
        notifications={notifications} 
        onDismiss={dismissNotification} 
      />
    </div>
  );
};

// Root app component that handles authentication state
const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Entering the quantum realm...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <AppViews /> : <AuthViews />;
};

// Main App component with all providers
function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;