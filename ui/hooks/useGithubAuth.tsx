import { useAuth } from '@/contexts/AuthContext';
import { githubService } from '@/services/githubService';
import { useMutation } from '@tanstack/react-query';
import { storage } from '@/utils/storage';

export function useGithubAuth() {
  const { updateUser } = useAuth();

  const authMutation = useMutation({
    mutationKey: ['github-auth'],
    mutationFn: async (code: string) => {
      const state = localStorage.getItem('github_oauth_state');
      if (!state) throw new Error('Invalid state');

      const { access_token } = await githubService.exchangeCodeForToken(code, state);
      const userData = await githubService.fetchUserData(access_token);

      // call user to story user data
      storage.setAuthState({
        user: userData,
        accessToken: access_token,
      });

      updateUser(userData);
      return userData;
    },
  });

  return authMutation;
}