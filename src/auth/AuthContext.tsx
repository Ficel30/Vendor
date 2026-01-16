import React from 'react';
import { apiPost } from '../api/client';

type AuthState = {
  token: string | null;
  role: string | null;
  isVerified: boolean;
};

type AuthContextValue = {
  auth: AuthState;
  login: (emailOrPhone: string, password: string) => Promise<void>;
  signup: (name: string, email: string, phone: string, password: string, agreedToTerms: boolean) => Promise<void>;
  selectRole: (role: 'student' | 'rider') => Promise<void>;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [auth, setAuth] = React.useState<AuthState>(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const isVerified = localStorage.getItem('isVerified') === 'true';
    return { token, role, isVerified };
  });

  const login = React.useCallback(async (emailOrPhone: string, password: string) => {
    const res = await apiPost<{ token: string; role: string | null; isVerified: boolean }>('/auth/login', { emailOrPhone, password }, { headers: {} });
    localStorage.setItem('token', res.token);
    if (res.role) localStorage.setItem('role', res.role);
    localStorage.setItem('isVerified', String(res.isVerified));
    setAuth({ token: res.token, role: res.role, isVerified: res.isVerified });
  }, []);

  const signup = React.useCallback(async (name: string, email: string, phone: string, password: string, agreedToTerms: boolean) => {
    await apiPost('/auth/signup', { name, email, phone, password, agreedToTerms }, { headers: {} });
  }, []);

  const selectRole = React.useCallback(async (role: 'student' | 'rider') => {
    const res = await apiPost<{ token: string; role: string }>('/auth/select-role', { role });
    localStorage.setItem('token', res.token);
    localStorage.setItem('role', res.role);
    setAuth((prev) => ({ ...prev, token: res.token, role: res.role }));
  }, []);

  const logout = React.useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('isVerified');
    setAuth({ token: null, role: null, isVerified: false });
  }, []);

  const value = React.useMemo(() => ({ auth, login, signup, selectRole, logout }), [auth, login, signup, selectRole, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function getAuthToken(): string | null {
  return localStorage.getItem('token');
}


