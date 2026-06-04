import { useState, useCallback } from 'react';

const AUTH_KEY = 'aura_auth';

function loadAuth() {
  try {
    const data = localStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState(loadAuth);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    void password;
    setLoading(true);
    // Mock login — replace with Supabase/Firebase
    await new Promise(resolve => setTimeout(resolve, 800));
    const mockUser = {
      id: 'user_1',
      email,
      name: email.split('@')[0],
      avatar: null,
      isPremium: false,
      createdAt: Date.now(),
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
    setLoading(false);
    return mockUser;
  }, []);

  const signup = useCallback(async (email, password, name) => {
    void password;
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const mockUser = {
      id: 'user_' + Date.now(),
      email,
      name: name || email.split('@')[0],
      avatar: null,
      isPremium: false,
      createdAt: Date.now(),
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
    setLoading(false);
    return mockUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockUser = {
      id: 'google_user_1',
      email: 'user@gmail.com',
      name: 'Google User',
      avatar: null,
      isPremium: false,
      createdAt: Date.now(),
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
    setLoading(false);
    return mockUser;
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    loginWithGoogle,
  };
}
