import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants';

// Layout
import { AppShell } from '@/components/layout/AppShell';

// Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import HomePage from '@/pages/home/HomePage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import DocumentsPage from '@/pages/documents/DocumentsPage';
import DocumentDetailPage from '@/pages/documents/DocumentDetailPage';
import UploadPage from '@/pages/upload/UploadPage';
import SearchPage from '@/pages/search/SearchPage';
import AIAssistantPage from '@/pages/ai-assistant/AIAssistantPage';
import ApprovalsPage from '@/pages/approvals/ApprovalsPage';
import AnalyticsPage from '@/pages/analytics/AnalyticsPage';
import ContractsPage from '@/pages/contracts/ContractsPage';
import UsersPage from '@/pages/users/UsersPage';
import DepartmentsPage from '@/pages/departments/DepartmentsPage';
import NotificationsPage from '@/pages/notifications/NotificationsPage';
import SettingsPage from '@/pages/settings/SettingsPage';
import OcrViewerPage from '@/pages/ocr/OcrViewerPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to={ROUTES.login} replace />;
  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.login} element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<HomePage />} />
        <Route path="home" element={<HomePage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="documents/:id" element={<DocumentDetailPage />} />
        <Route path="contracts" element={<ContractsPage />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="ai-assistant" element={<AIAssistantPage />} />
        <Route path="approvals" element={<ApprovalsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="ocr/:id" element={<OcrViewerPage />} />
        <Route path="ocr" element={<OcrViewerPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
