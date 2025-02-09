'use client';

import { Suspense } from 'react';
import { GitHubCallbackHandler } from '@/components/auth/GithubCallbackHandler';
import { Loader2 } from "lucide-react";

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold mb-4">Loading...</h1>
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
      </div>
    </div>
  );
}

export default function GitHubCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GitHubCallbackHandler />
    </Suspense>
  );
}