import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SpaceView } from '../components/SpaceView';

export function SpaceDetailPage() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/spaces');
  };

  if (!spaceId) {
    navigate('/spaces');
    return null;
  }

  return (
    <SpaceView
      spaceId={spaceId}
      onBack={handleBack}
    />
  );
}