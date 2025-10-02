import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SpaceDiscovery } from '../components/SpaceDiscovery';

export function SpacesPage() {
  const navigate = useNavigate();

  const handleViewSpace = (spaceId: string) => {
    navigate(`/spaces/${spaceId}`);
  };

  return <SpaceDiscovery onViewSpace={handleViewSpace} />;
}