import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { NetworkProvider } from './contexts/NetworkContext';
import { TestPage } from './components/TestPage';

function App() {
  return (
    <AuthProvider>
      <NetworkProvider>
        <TestPage />
      </NetworkProvider>
    </AuthProvider>
  );
}

export default App;