"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'operator' | 'manager' | 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  site: string;
  title: string;
  description?: string;
}

export const DEMO_ACCOUNTS: Record<'operator' | 'manager' | 'admin', User> = {
  operator: {
    id: "usr-operator",
    username: "operator",
    name: "A. Meena",
    email: "operator@beumer.com",
    role: "operator",
    site: "Rajasthan Ore Hub",
    title: "Site Operator",
    description: "Maker — monitors own site and raises requests",
  },
  manager: {
    id: "usr-manager",
    username: "manager",
    name: "K. Iyer",
    email: "manager@beumer.com",
    role: "manager",
    site: "Rajasthan Ore Hub",
    title: "Site Manager",
    description: "Checker — everything an operator sees, plus approvals",
  },
  admin: {
    id: "usr-admin",
    username: "admin",
    name: "M. Braun",
    email: "admin@beumer.com",
    role: "admin",
    site: "Rajasthan Ore Hub",
    title: "Administrator",
    description: "Customers, hierarchy, assets and configuration",
  },
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  getAuthRedirectAction: () => (() => void) | null;
  clearAuthRedirectAction: () => void;
  setAuthRedirectAction: (action: () => void) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let pendingRedirectAction: (() => void) | null = null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    }
  }, []);

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const getAuthRedirectAction = () => pendingRedirectAction;

  const clearAuthRedirectAction = () => {
    pendingRedirectAction = null;
  };

  const setAuthRedirectAction = (action: () => void) => {
    pendingRedirectAction = action;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        logout,
        getAuthRedirectAction,
        clearAuthRedirectAction,
        setAuthRedirectAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    // Return a safe fallback so components can still function outside AuthProvider
    return {
      user: null,
      token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
      isAuthenticated: typeof window !== 'undefined' && !!localStorage.getItem('token'),
      login: (token: string, userData: User) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
        }
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      },
      getAuthRedirectAction: () => pendingRedirectAction,
      clearAuthRedirectAction: () => {
        pendingRedirectAction = null;
      },
      setAuthRedirectAction: (action: () => void) => {
        pendingRedirectAction = action;
      },
    };
  }
  return context;
}
