import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Login } from '../components/Login';
import { Register } from '../components/Register';
import { ForgotPassword } from '../components/ForgotPassword';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../components/NotificationSystem';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, error, clearError } = useAuth();
  const { showSuccess } = useNotifications();

  const from = location.state?.from?.pathname || '/dashboard';

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      console.log('[LoginPage] User already authenticated, redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleLoginSuccess = React.useCallback(() => {
    showSuccess('Welcome back!', 'You have successfully entered the quantum realm');
    navigate(from, { replace: true });
  }, [showSuccess, navigate, from]);

  const handleSwitchToRegister = () => {
    navigate('/register', { state: { from: location.state?.from } });
  };

  const handleSwitchToForgotPassword = () => {
    navigate('/forgot-password', { state: { from: location.state?.from } });
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Don't render if authenticated (will redirect)
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <Login
      onSwitchToRegister={handleSwitchToRegister}
      onSwitchToForgotPassword={handleSwitchToForgotPassword}
      onLoginSuccess={handleLoginSuccess}
    />
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, error, clearError } = useAuth();
  const { showSuccess } = useNotifications();

  const from = location.state?.from?.pathname || '/dashboard';

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      console.log('[RegisterPage] User already authenticated, redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleRegisterSuccess = React.useCallback(() => {
    showSuccess('Account created!', 'Your quantum identity has been established');
    navigate(from, { replace: true });
  }, [showSuccess, navigate, from]);

  const handleSwitchToLogin = () => {
    navigate('/login', { state: { from: location.state?.from } });
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Don't render if authenticated (will redirect)
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <Register
      onSwitchToLogin={handleSwitchToLogin}
      onRegisterSuccess={handleRegisterSuccess}
    />
  );
}

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    navigate('/login', { state: { from: location.state?.from } });
  };

  return (
    <ForgotPassword
      onBack={handleBack}
      onBackToLogin={handleBack}
    />
  );
}