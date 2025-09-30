import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ContentComposer } from './ContentComposer';
import { ActivityFeed } from './ActivityFeed';

export const TestPage: React.FC = () => {
  const { isAuthenticated, user, login, register, logout, error } = useAuth();
  const [username, setUsername] = useState('testuser');
  const [password, setPassword] = useState('password');
  const [email, setEmail] = useState('test@test.com');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    register(username, email, password);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password);
  };

  if (!isAuthenticated) {
    return (
      <div className="p-8 bg-gray-900 text-white min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold mb-6 text-center text-cyan-400">Test & Diagnostics</h1>
          <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Login or Register</h2>
            {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md mb-4">{error}</p>}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-300">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-300">Email (for registration)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors">
                Login
              </button>
              <button onClick={handleRegister} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition-colors">
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400">Holographic Network Testbed</h1>
            <p className="text-gray-400">Welcome, <span className="font-bold text-white">{user?.username}</span> ({user?.id})</p>
          </div>
          <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-purple-300">1. Create a Memory</h2>
            <ContentComposer />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4 text-purple-300">2. Observe Network Activity</h2>
            <ActivityFeed />
          </div>
        </div>
      </div>
    </div>
  );
};