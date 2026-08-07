import React, { Suspense, Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';

import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/store/authStore';
import { AppShell } from '@/components/layout/AppShell';

// Pages
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import DocumentsPage from '@/pages/documents/DocumentsPage';
import DocumentDetailPage from '@/pages/documents/DocumentDetailPage';
import UploadPage from '@/pages/upload/UploadPage';
import SearchPage from '@/pages/search/SearchPage';
import AIAssistantPage from '@/pages/ai-assistant/AIAssistantPage';
import ApprovalsPage from '@/pages/approvals/ApprovalsPage';
import AnalyticsPage from '@/pages/analytics/AnalyticsPage';
import UsersPage from '@/pages/users/UsersPage';
import DepartmentsPage from '@/pages/departments/DepartmentsPage';
import NotificationsPage from '@/pages/notifications/NotificationsPage';
import SettingsPage from '@/pages/settings/SettingsPage';
import ContractsPage from '@/pages/contracts/ContractsPage';
import AgencyShowcasePage from '@/pages/agency/AgencyShowcasePage';

// Error Boundary Class
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Uncaught Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-6">
          <div className="bg-[#1f2937] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mx-auto text-xl font-bold">
              🚇
            </div>
            <h2 className="text-xl font-bold text-white">KMRL IntelliDocs</h2>
            <p className="text-sm text-slate-400">
              An unexpected render issue occurred. Click below to refresh your session.
            </p>
            <div className="bg-black/30 p-3 rounded-xl text-left border border-white/[0.04] text-xs font-mono text-red-300 max-h-32 overflow-y-auto">
              {this.state.error?.message || 'Render exception'}
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/login';
                }}
                className="flex-1 py-2.5 bg-white/[0.05] hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold border border-white/10"
              >
                Reset Session
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold"
              >
                Reload App
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading fallback
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0f1e]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Loading KMRL IntelliDocs...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public & Showcase routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/agency" element={<AgencyShowcasePage />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="documents" element={<DocumentsPage />} />
                <Route path="documents/:id" element={<DocumentDetailPage />} />
                <Route path="contracts" element={<ContractsPage />} />
                <Route path="upload" element={<UploadPage />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="ai-assistant" element={<AIAssistantPage />} />
                <Route path="approvals" element={<ApprovalsPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="departments" element={<DepartmentsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>

        <Toaster
          position="top-right"
          theme="dark"
          richColors
          toastOptions={{
            style: {
              background: '#1f2937',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f1f5f9',
            },
          }}
        />

        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
