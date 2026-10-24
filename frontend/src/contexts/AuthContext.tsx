import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('inkloom_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMe = async () => {
      const storedToken = localStorage.getItem('inkloom_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch (err) {
        localStorage.removeItem('inkloom_token');
        localStorage.removeItem('inkloom_user');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMe();
  }, []);

  const login = async (email: string, password: string = 'password123') => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('inkloom_token', access_token);
    localStorage.setItem('inkloom_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
  };

  const register = async (data: any) => {
    const res = await api.post('/auth/register', data);
    const { access_token, user: userData } = res.data;
    localStorage.setItem('inkloom_token', access_token);
    localStorage.setItem('inkloom_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('inkloom_token');
    localStorage.removeItem('inkloom_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const switchDemoRole = async (role: UserRole) => {
    const emailMap: Record<UserRole, string> = {
      admin: 'admin@inkloom.ai',
      approver: 'approver@inkloom.ai',
      manager: 'manager@inkloom.ai',
      creator: 'creator@inkloom.ai',
    };
    await login(emailMap[role], 'password123');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, switchDemoRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
