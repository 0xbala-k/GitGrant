'use client'

import { useState } from "react";
import { useMaintainer } from "@/contexts/MaintainerContext";
import { StatCard } from "@/components/StatCard";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  GitForkIcon, 
  UsersIcon,
  DollarSignIcon,
  WalletIcon,
  StarIcon,
  CircleIcon
} from "lucide-react";
import { ImportRepositoryDialog } from "@/components/dialogs/ImportRepositoryDialog";
import { CreateGrantDialog } from "@/components/dialogs/CreateGrantDialog";

export default function MaintainerPage() {
  const { 
    repositories, 
    stats, 
    isLoading, 
    error,
    importRepository,
    createGrant
  } = useMaintainer();
  
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [createGrantDialogOpen, setCreateGrantDialogOpen] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<string>('');

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Maintainer Dashboard</h1>
        <Button onClick={() => setImportDialogOpen(true)}>
          <GitForkIcon className="mr-2 h-4 w-4" />
          Import Repository
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Repositories"
          value={stats.totalRepositories}
          icon={<GitForkIcon className="h-4 w-4" />}
          description="Active repositories"
        />
        <StatCard
          title="Active Grants"
          value={stats.activeGrants}
          icon={<DollarSignIcon className="h-4 w-4" />}
          description="Ongoing grants"
        />
        <StatCard
          title="Total Contributors"
          value={stats.totalContributors}
          icon={<UsersIcon className="h-4 w-4" />}
          description="Across all repos"
        />
        <StatCard
          title="Total Funding"
          value={`$${stats.totalFunding.toLocaleString()}`}
          icon={<WalletIcon className="h-4 w-4" />}
          description="Available funds"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full">
        {repositories.map((repo) => (
          <Card key={repo.id} className="p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{repo.name}</h3>
                <GitForkIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">{repo.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <StarIcon className="mr-2 h-4 w-4" />
                    {repo.stars} stars
                  </div>
                  <div className="flex items-center text-sm">
                    <GitForkIcon className="mr-2 h-4 w-4" />
                    {repo.forks} forks
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CircleIcon className="mr-2 h-4 w-4" />
                    {repo.openIssues} issues
                  </div>
                  <div className="flex items-center text-sm">
                    <DollarSignIcon className="mr-2 h-4 w-4" />
                    ${repo.totalFunding}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => window.open(`https://github.com/${repo.name}`, '_blank')}
                >
                  View on GitHub
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => {
                    setSelectedRepo(repo.name);
                    setCreateGrantDialogOpen(true);
                  }}
                >
                  Fund
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <ImportRepositoryDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={importRepository}
      />
      <CreateGrantDialog
        open={createGrantDialogOpen}
        onOpenChange={setCreateGrantDialogOpen}
        onSubmit={createGrant}
        repositories={repositories}
        defaultRepository={selectedRepo}
      />
    </div>
  );
}