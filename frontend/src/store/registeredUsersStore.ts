import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RegisteredUser {
  id: string;
  email: string;
  passwordHash: string; // Plaintext or hashed for local demo validation
  fullName: string;
  role: 'employee' | 'manager' | 'admin';
  department: string;
  createdAt: string;
}

const DEFAULT_USERS: RegisteredUser[] = [
  {
    id: 'user-admin',
    email: 'admin@kmrl.in',
    passwordHash: 'kmrl@2024',
    fullName: 'Suresh Prabhu',
    role: 'admin',
    department: 'Management',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'user-manager',
    email: 'rajan.menon@kmrl.in',
    passwordHash: 'kmrl@2024',
    fullName: 'Rajan Menon',
    role: 'manager',
    department: 'Finance',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'user-employee',
    email: 'priya.nair@kmrl.in',
    passwordHash: 'kmrl@2024',
    fullName: 'Priya Nair',
    role: 'employee',
    department: 'Operations',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

interface RegisteredUsersStore {
  users: RegisteredUser[];
  registerUser: (user: Omit<RegisteredUser, 'id' | 'createdAt'>) => RegisteredUser;
  findUser: (email: string) => RegisteredUser | undefined;
  validateCredentials: (email: string, password: string) => RegisteredUser | null;
}

export const useRegisteredUsersStore = create<RegisteredUsersStore>()(
  persist(
    (set, get) => ({
      users: DEFAULT_USERS,
      registerUser: (userData) => {
        const existing = get().users.find(
          (u) => u.email.toLowerCase() === userData.email.toLowerCase()
        );
        if (existing) {
          throw new Error('An account with this email address already exists.');
        }

        const newUser: RegisteredUser = {
          ...userData,
          id: `user-${Date.now()}`,
          email: userData.email.toLowerCase().trim(),
          createdAt: new Date().toISOString(),
        };

        set((state) => ({ users: [newUser, ...state.users] }));
        return newUser;
      },
      findUser: (email) => {
        return get().users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
      },
      validateCredentials: (email, password) => {
        const user = get().users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase().trim()
        );
        if (user && user.passwordHash === password) {
          return user;
        }
        return null;
      },
    }),
    {
      name: 'kmrl-registered-users-v1',
    }
  )
);
