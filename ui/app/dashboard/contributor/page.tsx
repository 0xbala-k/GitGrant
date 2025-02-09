'use client'

import { useState } from "react";
import { useContributor } from "@/contexts/ContributorContext";
import { StatCard } from "@/components/StatCard";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  GitPullRequestIcon, 
  DollarSignIcon,
  WalletIcon,
} from "lucide-react";
import { ClaimPRDialog } from "@/components/dialogs/ClaimPRDialog";

export default function ContributorDashboard() {
  const { 
    contributions, 
    stats, 
    isLoading, 
    error,
    claimPR
  } = useContributor();
  
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error: {error.message}</div>;

  const pendingContributions = contributions.filter(c => c.status === 'pending');

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Contributor Dashboard</h1>
        <Button onClick={() => setClaimDialogOpen(true)}>
          <GitPullRequestIcon className="mr-2 h-4 w-4" />
          Claim PR
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Earnings"
          value={`$${stats.totalEarnings.toLocaleString()}`}
          icon={<DollarSignIcon className="h-4 w-4" />}
          description="Total rewards earned"
        />
        <StatCard
          title="Total Contributions"
          value={stats.totalContributions}
          icon={<GitPullRequestIcon className="h-4 w-4" />}
          description="All time contributions"
        />
        <StatCard
          title="Active Contributions"
          value={stats.activeContributions}
          icon={<WalletIcon className="h-4 w-4" />}
          description="Pending rewards"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Contributions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {pendingContributions.map((contribution) => (
            <Card key={contribution.id} className="p-6">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{contribution.repository}</h3>
                  <span className="text-muted-foreground">#{contribution.issueNumber}</span>
                </div>
                <p className="text-sm text-muted-foreground">{contribution.issueTitle}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Reward: ${contribution.amount}
                  </span>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(contribution.issueUrl, '_blank')}
                  >
                    View Issue
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <ClaimPRDialog
        open={claimDialogOpen}
        onOpenChange={setClaimDialogOpen}
        onSubmit={claimPR}
      />
    </div>
  );
}