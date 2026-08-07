export const DOCUMENT_STATUSES = {
  draft: 'Draft',
  pending: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  archived: 'Archived',
} as const;

export const PRIORITIES = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
} as const;

export const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  documents: '/documents',
  upload: '/upload',
  search: '/search',
  aiAssistant: '/ai-assistant',
  approvals: '/approvals',
  analytics: '/analytics',
  settings: '/settings',
  login: '/login',
  register: '/register',
} as const;
