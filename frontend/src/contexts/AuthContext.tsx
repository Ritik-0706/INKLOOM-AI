import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(sessionStorage.getItem('inkloom_token') ?? localStorage.getItem('inkloom_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMe = async () => {
      const storedToken = sessionStorage.getItem('inkloom_token') ?? localStorage.getItem('inkloom_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch (err) {
        sessionStorage.removeItem('inkloom_token');
        localStorage.removeItem('inkloom_token');
        sessionStorage.removeItem('inkloom_user');
        localStorage.removeItem('inkloom_user');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMe();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, user: userData } = res.data;
    sessionStorage.setItem('inkloom_token', access_token);
    localStorage.removeItem('inkloom_token');
    sessionStorage.setItem('inkloom_user', JSON.stringify(userData));
    localStorage.removeItem('inkloom_user');
    setToken(access_token);
    setUser(userData);
  };

  const register = async (data: any) => {
    const res = await api.post('/auth/register', data);
    const { access_token, user: userData } = res.data;
    sessionStorage.setItem('inkloom_token', access_token);
    localStorage.removeItem('inkloom_token');
    sessionStorage.setItem('inkloom_user', JSON.stringify(userData));
    localStorage.removeItem('inkloom_user');
    setToken(access_token);
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem('inkloom_token');
    localStorage.removeItem('inkloom_token');
    sessionStorage.removeItem('inkloom_user');
    localStorage.removeItem('inkloom_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
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
