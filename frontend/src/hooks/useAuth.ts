import { useAuthStore, User } from '../store/authStore';

// Inline mock users so we don't depend on a non-existent export
const MOCK_USERS: User[] = [
  { id: 'u1', email: 'admin@kmrl.in', full_name: 'Suresh Prabhu', role: 'admin', department_name: 'Operations', is_active: true, is_verified: true },
  { id: 'u2', email: 'rajan.menon@kmrl.in', full_name: 'Rajan Menon', role: 'manager', department_name: 'Finance', is_active: true, is_verified: true },
  { id: 'u3', email: 'priya.nair@kmrl.in', full_name: 'Priya Nair', role: 'manager', department_name: 'Human Resources', is_active: true, is_verified: true },
  { id: 'u4', email: 'arun.kumar@kmrl.in', full_name: 'Arun Kumar', role: 'employee', department_name: 'Maintenance', is_active: true, is_verified: true },
  { id: 'u5', email: 'deepa.thomas@kmrl.in', full_name: 'Deepa Thomas', role: 'employee', department_name: 'Operations', is_active: true, is_verified: true },
];

export const useAuth = () => {
  const { user, accessToken, isAuthenticated, setAuth, logout: setLogout } = useAuthStore();

  const login = async (email: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const foundUser = MOCK_USERS.find((u: User) => u.email === email);
        if (foundUser) {
          setAuth(foundUser, 'mock-jwt-token-12345');
          resolve();
        } else {
          reject(new Error('User not found. Use a mock email like admin@kmrl.in'));
        }
      }, 800);
    });
  };

  const logout = () => {
    setLogout();
  };

  return { user, token: accessToken, isAuthenticated, login, logout };
};
