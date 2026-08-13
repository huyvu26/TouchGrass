import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {setUnauthorizedHandler} from '../services/apiClient';
import {removeAccessToken} from '../storage/authStorage';
import type {AuthUser} from '../types/auth';
import {resetToLogin} from '../navigation/rootNavigation';

interface AuthContextValue {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}: React.PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const logout = useCallback(async () => {
    await removeAccessToken();
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      resetToLogin();
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const value = useMemo(
    () => ({user, setUser, logout}),
    [logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được dùng bên trong AuthProvider.');
  }
  return context;
}
