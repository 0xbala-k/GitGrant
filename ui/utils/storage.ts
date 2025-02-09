import { AuthState } from "@/types/auth";

  const STORAGE_KEY = 'github_auth_state';
  
  export const storage = {
    getAuthState: (): AuthState => {
      if (typeof window === 'undefined') return { user: null, accessToken: null };
      
      try {
        const state = localStorage.getItem(STORAGE_KEY);
        return state ? JSON.parse(state) : { user: null, accessToken: null };
      } catch (error) {
        console.error('Failed to parse auth state:', error);
        return { user: null, accessToken: null };
      }
    },
  
    setAuthState: (state: AuthState): void => {
      if (typeof window === 'undefined') return;
      
      try {
        const stateWithExpiration = {
          ...state,
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateWithExpiration));
      } catch (error) {
        console.error('Failed to save auth state:', error);
      }
    },
  
    clearAuthState: (): void => {
      if (typeof window === 'undefined') return;
      
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('github_oauth_state');
      } catch (error) {
        console.error('Failed to clear auth state:', error);
      }
    },
  
    isAuthenticated: (): boolean => {
      if (typeof window === 'undefined') return false;
      
      try {
        const state = storage.getAuthState();
        if (!state.user || !state.accessToken || !state.expiresAt) return false;
        return state.expiresAt > Date.now();
      } catch (error) {
        console.log(error);
        return false;
      }
    },
  };