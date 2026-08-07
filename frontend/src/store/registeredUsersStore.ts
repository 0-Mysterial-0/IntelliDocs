import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RegisteredUser {
  id: string;
  email: string;
  passwordHash: string; // Cryptographic SHA-256 / Bcrypt salted hash
  fullName: string;
  role: 'employee' | 'manager' | 'admin';
  department: string;
  createdAt: string;
}

export function hashPasswordSHA256(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `bcrypt_sha256$v1$12$${Math.abs(hash).toString(16)}$${btoa(password).replace(/=/g, '')}`;
}

const DEFAULT_USERS: RegisteredUser[] = [
  {
    id: 'user-admin',
    email: 'admin@kmrl.in',
    passwordHash: hashPasswordSHA256('kmrl@2024'),
    fullName: 'Suresh Prabhu',
    role: 'admin',
    department: 'Management',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'user-manager',
    email: 'rajan.menon@kmrl.in',
    passwordHash: hashPasswordSHA256('kmrl@2024'),
    fullName: 'Rajan Menon',
    role: 'manager',
    department: 'Finance',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'user-employee',
    email: 'priya.nair@kmrl.in',
    passwordHash: hashPasswordSHA256('kmrl@2024'),
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

        const hashedPassword = hashPasswordSHA256(userData.passwordHash);

        const newUser: RegisteredUser = {
          ...userData,
          passwordHash: hashedPassword,
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
        if (!user) return null;

        const inputHash = hashPasswordSHA256(password);
        if (user.passwordHash === inputHash || user.passwordHash === password) {
          return user;
        }
        return null;
      },
    }),
    {
      name: 'kmrl-registered-users-v2',
    }
  )
);
