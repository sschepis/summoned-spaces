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
  const { error, clearError } = useAuth();
  const { showSuccess } = useNotifications();

  const from = location.state?.from?.pathname || '/dashboard';

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
  const { error, clearError } = useAuth();
  const { showSuccess } = useNotifications();

  const from = location.state?.from?.pathname || '/dashboard';

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