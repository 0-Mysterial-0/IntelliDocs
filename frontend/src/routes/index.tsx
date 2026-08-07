import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants';

// Layout
import { AppShell } from '@/components/layout/AppShell';

// Pages
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import DocumentsPage from '@/pages/documents/DocumentsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to={ROUTES.login} replace />;
  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.login} element={<LoginPage />} />
      
      <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<Navigate to={ROUTES.dashboard} replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        {/* Mocking other routes for completeness */}
        <Route path="upload" element={<div className="p-8">Upload Page (Scaffolded)</div>} />
        <Route path="search" element={<div className="p-8">Search Page (Scaffolded)</div>} />
        <Route path="ai-assistant" element={<div className="p-8">AI Assistant (Scaffolded)</div>} />
        <Route path="approvals" element={<div className="p-8">Approvals (Scaffolded)</div>} />
        <Route path="analytics" element={<div className="p-8">Analytics (Scaffolded)</div>} />
        <Route path="settings" element={<div className="p-8">Settings (Scaffolded)</div>} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
