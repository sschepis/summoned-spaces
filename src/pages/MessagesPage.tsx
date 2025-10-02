import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DirectMessages } from '../components/DirectMessages';

export function MessagesPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/dashboard');
  };

  return <DirectMessages onBack={handleBack} />;
}