'use client'

import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Contribution {
  id: number;
  repository: string;
  issueNumber: string;
  issueTitle: string;
  issueUrl: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
}

interface ClaimPRData {
  prUrl: string;
}

interface ContributorStats {
  totalEarnings: number;
  totalContributions: number;
  activeContributions: number;
}

interface ContributorContextType {
  contributions: Contribution[];
  stats: ContributorStats;
  isLoading: boolean;
  error: Error | null;
  claimPR: (data: ClaimPRData) => Promise<void>;
}

const ContributorContext = createContext<ContributorContextType | undefined>(undefined);

const fetchContributions = async (): Promise<Contribution[]> => {
  // Mock API call - replace with actual API integration
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          repository: "owner/project-a",
          issueNumber: "42",
          issueTitle: "Fix memory leak in authentication module",
          issueUrl: "https://github.com/microsoft/WSL/issues/12568",
          amount: 500,
          status: 'pending'
        },
        {
          id: 2,
          repository: "owner/project-b",
          issueNumber: "17",
          issueTitle: "Implement dark mode support",
          issueUrl: "https://github.com/microsoft/WSL/issues/12567",
          amount: 300,
          status: 'approved'
        },
        {
          id: 3,
          repository: "owner/project-c",
          issueNumber: "8",
          issueTitle: "Add support for WebP images",
          issueUrl: "https://github.com/microsoft/WSL/issues/12566",
          amount: 200,
          status: 'rejected'
        },
      ]);
    }, 1000);
  });
};

const parseGitHubPRUrl = (url: string) => {
  try {
    const regex = /github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/;
    const matches = url.match(regex);
    if (!matches) throw new Error('Invalid GitHub PR URL');
    
    return {
      owner: matches[1],
      repo: matches[2],
      prNumber: matches[3]
    };
  } catch (error) {
    console.log(error);
    throw new Error('Invalid GitHub PR URL format');
  }
};

export function ContributorProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data: contributions = [], isLoading, error } = 
    useQuery({
      queryKey: ['contributions'],
      queryFn: fetchContributions,
    });

  const claimPRMutation = useMutation({
    mutationFn: async (data: ClaimPRData) => {
      const { owner, repo, prNumber } = parseGitHubPRUrl(data.prUrl);
      
      // Mock API call - replace with actual API integration
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`);
      if (!response.ok) {
        throw new Error('Pull request not found or inaccessible');
      }

      // Add validation logic here (e.g., PR is open, linked to an issue, etc.)
      
      return {
        owner,
        repo,
        prNumber
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contributions'] });
    },
  });

  const stats: ContributorStats = {
    totalEarnings: contributions.reduce((sum, c) => sum + c.amount, 0),
    totalContributions: contributions.length,
    activeContributions: contributions.filter(c => c.status === 'pending').length,
  };

  const claimPR = async (data: ClaimPRData) => {
    await claimPRMutation.mutateAsync(data);
  };

  const value: ContributorContextType = {
    contributions,
    stats,
    isLoading,
    error,
    claimPR,
  };

  return (
    <ContributorContext.Provider value={value}>
      {children}
    </ContributorContext.Provider>
  );
}

export function useContributor() {
  const context = useContext(ContributorContext);
  if (context === undefined) {
    throw new Error('useContributor must be used within a ContributorProvider');
  }
  return context;
}

export type { Contribution, ClaimPRData };