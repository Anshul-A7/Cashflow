import React, { createContext, useContext, useState, useEffect } from 'react';
import { Business, User, AuthResponse } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  activeBusiness: Business | null;
  setActiveBusiness: (b: Business) => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: {
    fullName: string;
    email: string;
    password: string;
    businessName: string;
    taxId?: string;
    currency?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeBusiness, setActiveBusinessState] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleAuthSuccess = (res: AuthResponse) => {
    localStorage.setItem('token', res.token);
    const primaryBusiness = res.businesses.find((b) => b.id === res.activeBusinessId) || res.businesses[0] || null;
    setActiveBusinessState(primaryBusiness);
    setUser({
      id: res.userId,
      email: res.email,
      fullName: res.fullName,
      role: 'ROLE_BUSINESS_OWNER',
      businesses: res.businesses,
    });
  };

  const login = async (email: string, pass: string) => {
    const res = await authApi.login(email, pass);
    handleAuthSuccess(res);
  };

  const register = async (data: {
    fullName: string;
    email: string;
    password: string;
    businessName: string;
    taxId?: string;
    currency?: string;
  }) => {
    const res = await authApi.register(data);
    handleAuthSuccess(res);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setActiveBusinessState(null);
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const u = await authApi.getCurrentUser();
      setUser(u);
      if (u.businesses && u.businesses.length > 0) {
        setActiveBusinessState((prev) => {
          if (prev && u.businesses.some((b) => b.id === prev.id)) {
            return u.businesses.find((b) => b.id === prev.id)!;
          }
          return u.businesses[0];
        });
      }
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const setActiveBusiness = (b: Business) => {
    setActiveBusinessState(b);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeBusiness,
        setActiveBusiness,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
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

