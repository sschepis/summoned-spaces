import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, RoleProtectedRoute } from './ProtectedRoute';

// Auth Pages
import { LoginPage, RegisterPage, ForgotPasswordPage } from '../pages/AuthPages';

// Main Pages
import { DashboardPage } from '../pages/DashboardPage';
import { SpacesPage } from '../pages/SpacesPage';
import { SpaceDetailPage } from '../pages/SpaceDetailPage';
import { MessagesPage } from '../pages/MessagesPage';

// Other Pages
import {
  FriendsPage,
  SearchPage,
  AnalyticsPage,
  SettingsPage,
  SystemAdminPage,
  ContentAdminPage,
  FeedPage,
  NotFoundPage
} from '../pages/OtherPages';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/feed" element={<FeedPage />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/spaces"
        element={
          <ProtectedRoute>
            <SpacesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/spaces/:spaceId"
        element={
          <ProtectedRoute>
            <SpaceDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/friends"
        element={
          <ProtectedRoute>
            <FriendsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/system"
        element={
          <RoleProtectedRoute requiredRoles={['admin']}>
            <SystemAdminPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/admin/content"
        element={
          <RoleProtectedRoute requiredRoles={['admin']}>
            <ContentAdminPage />
          </RoleProtectedRoute>
        }
      />

      {/* Catch-all route for 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}