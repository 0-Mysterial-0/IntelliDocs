export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  departmentId: string;
  avatarUrl?: string;
}

export interface Department {
  id: string;
  name: string;
  color: string;
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  departmentId: string;
  authorId: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'archived';
  priority: 'low' | 'medium' | 'high';
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  version: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
