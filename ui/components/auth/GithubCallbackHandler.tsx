'use client';

import { useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useGithubAuth } from '@/hooks/useGithubAuth';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GitHubCallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const authMutation = useGithubAuth();

  const handleAuth = useCallback(async () => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');
    const savedState = localStorage.getItem('github_oauth_state');

    if (error) {
      router.push('/login?error=' + error);
      return;
    }

    if (!state || state !== savedState) {
      router.push('/login?error=invalid_state');
      return;
    }

    if (!code) {
      router.push('/login?error=no_code');
      return;
    }

    if (isAuthenticated) {
      router.push('/dashboard');
      return;
    }

    try {
      await authMutation.mutateAsync(code);
      router.push('/dashboard');
    } catch (error) {
      console.error('Authentication failed:', error);
      router.push('/login?error=authentication_failed');
    }
  }, [searchParams, router, authMutation, isAuthenticated]);

  useEffect(() => {
    if (!authMutation.isPending) {
      handleAuth();
    }
  }, [handleAuth, authMutation.isPending]);

  if (authMutation.isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4 text-red-600">
            Authentication Failed
          </h1>
          <p className="text-gray-600 mb-4">{authMutation.error.message}</p>
          <Button 
            variant="outline" 
            onClick={() => router.push('/login')}
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold mb-4">
          {authMutation.isPending ? 'Authenticating...' : 'Preparing authentication...'}
        </h1>
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
      </div>
    </div>
  );
}