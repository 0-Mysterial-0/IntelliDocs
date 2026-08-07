import fs from 'fs';
import path from 'path';

const SRC = path.join(process.cwd(), 'src');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const write = (file, content) => {
  const fullPath = path.join(SRC, file);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, content.trim());
  console.log('Created:', file);
};

const createComponent = (name, p) => write(p, `
import React from 'react';
import { cn } from '@/lib/utils';

export function ${name}({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-4", className)} {...props}>
      ${name} Component
    </div>
  );
}
`);

const createPage = (name, p) => write(p, `
import React from 'react';
export default function ${name}() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white">${name.replace('Page', '')}</h1>
      <p className="text-gray-400 mt-2">This page has been automatically scaffolded.</p>
    </div>
  );
}
`);

// BATCH 2 - Remaining UI Components
const uiComponents = ['avatar', 'dialog', 'dropdown-menu', 'select', 'tabs', 'tooltip', 'progress', 'separator', 'switch', 'checkbox', 'textarea', 'skeleton', 'scroll-area', 'table', 'sheet', 'command', 'popover', 'alert', 'label'];
uiComponents.forEach(c => write(`components/ui/${c}.tsx`, `export const ${c.charAt(0).toUpperCase() + c.slice(1)} = () => null;`));

// BATCH 3 - Remaining Common Components
['PageHeader', 'StatsCard', 'EmptyState', 'LoadingSpinner', 'SkeletonCard', 'SkeletonTable', 'FileIcon', 'StatusBadge', 'PriorityBadge', 'RoleBadge', 'ConfirmDialog', 'CommandPalette'].forEach(c => createComponent(c, `components/common/${c}.tsx`));

// BATCH 4 - Auth Pages
createPage('RegisterPage', 'pages/auth/RegisterPage.tsx');
createPage('ForgotPasswordPage', 'pages/auth/ForgotPasswordPage.tsx');

// BATCH 5 - Document Details
createPage('DocumentDetailPage', 'pages/documents/DocumentDetailPage.tsx');
['DocumentCard', 'DocumentTable', 'DocumentFilters', 'BulkActionsBar', 'VersionHistory', 'CommentThread', 'TagInput'].forEach(c => createComponent(c, `components/documents/${c}.tsx`));

// BATCH 6 - Upload + Search + AI
createPage('UploadPage', 'pages/upload/UploadPage.tsx');
createPage('SearchPage', 'pages/search/SearchPage.tsx');
createPage('AIAssistantPage', 'pages/ai-assistant/AIAssistantPage.tsx');

// BATCH 7 - Workflow + Analytics
createPage('ApprovalsPage', 'pages/approvals/ApprovalsPage.tsx');
createPage('AnalyticsPage', 'pages/analytics/AnalyticsPage.tsx');
['AreaChartCard', 'BarChartCard', 'PieChartCard'].forEach(c => createComponent(c, `components/analytics/${c}.tsx`));

// BATCH 8 - Admin Pages
createPage('UsersPage', 'pages/users/UsersPage.tsx');
createPage('DepartmentsPage', 'pages/departments/DepartmentsPage.tsx');
createPage('NotificationsPage', 'pages/notifications/NotificationsPage.tsx');
createPage('AuditLogsPage', 'pages/audit-logs/AuditLogsPage.tsx');
createPage('SettingsPage', 'pages/settings/SettingsPage.tsx');

// BATCH 1 - Hooks
['useNotifications', 'useApprovals', 'useSearch', 'useChat'].forEach(c => write(`hooks/${c}.ts`, `export const ${c} = () => ({ data: [], isLoading: false });`));

console.log('All remaining files generated successfully.');
