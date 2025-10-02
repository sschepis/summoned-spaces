import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SocialNetwork } from '../components/SocialNetwork';
import { SemanticSearch } from '../components/SemanticSearch';
import { AnalyticsBoard } from '../components/AnalyticsBoard';
import { UserSettings } from '../components/UserSettings';
import { SystemAdmin } from '../components/SystemAdmin';
import { ContentAdmin } from '../components/ContentAdmin';
import { PublicActivityStream } from '../components/PublicActivityStream';

export function FriendsPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/dashboard');
  };

  return <SocialNetwork onBack={handleBack} />;
}

export function SearchPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/dashboard');
  };

  return <SemanticSearch onBack={handleBack} />;
}

export function AnalyticsPage() {
  return <AnalyticsBoard />;
}

export function SettingsPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/dashboard');
  };

  return <UserSettings onBack={handleBack} />;
}

export function SystemAdminPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/dashboard');
  };

  return <SystemAdmin onBack={handleBack} />;
}

export function ContentAdminPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/dashboard');
  };

  return <ContentAdmin onBack={handleBack} />;
}

export function FeedPage() {
  return <PublicActivityStream />;
}

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-cyan-300 mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8">
          The quantum realm you're looking for doesn't exist in this dimension.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-3 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}