import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { GitHubUser } from '@/types/auth';
import { storage } from '@/utils/storage';
import { GITHUB_CLIENT_ID, GITHUB_REDIRECT_URI } from '@/config/github';

interface AuthContextType {
  user: GitHubUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  updateUser: (user: GitHubUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      try {
        if (storage.isAuthenticated()) {
          const authState = storage.getAuthState();
          setUser(authState.user);
        }
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = useCallback(() => {
    storage.clearAuthState();
    const state = crypto.randomUUID();
    localStorage.setItem('github_oauth_state', state);

    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: GITHUB_REDIRECT_URI,
      scope: 'read:user user:email',
      state,
    });

    window.location.href = `https://github.com/login/oauth/authorize?${params}`;
  }, []);

  const logout = useCallback(() => {
    storage.clearAuthState();
    setUser(null);
  }, []);

  const updateUser = useCallback((newUser: GitHubUser) => {
    setUser(newUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};