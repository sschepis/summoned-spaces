import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dashboard } from '../components/Dashboard';

export function DashboardPage() {
  const navigate = useNavigate();

  const handleViewSpace = (spaceId: string) => {
    navigate(`/spaces/${spaceId}`);
  };

  const handleOpenDirectMessages = () => {
    navigate('/messages');
  };

  const handleOpenSearch = () => {
    navigate('/search');
  };

  const handleOpenSettings = () => {
    navigate('/settings');
  };

  return (
    <Dashboard
      onViewSpace={handleViewSpace}
      onOpenDirectMessages={handleOpenDirectMessages}
      onOpenSearch={handleOpenSearch}
      onOpenSettings={handleOpenSettings}
    />
  );
}