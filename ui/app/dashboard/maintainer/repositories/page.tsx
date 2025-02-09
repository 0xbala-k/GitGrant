'use client'

import { useState } from "react";
import { useMaintainer } from "@/contexts/MaintainerContext";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GitForkIcon,
  SearchIcon,
  StarIcon,
  CircleIcon,
  DollarSignIcon
} from "lucide-react";
import { ImportRepositoryDialog } from "@/components/dialogs/ImportRepositoryDialog";
import { CreateGrantDialog } from "@/components/dialogs/CreateGrantDialog";

export default function RepositoriesPage() {
  const { repositories, isLoading, error, importRepository, createGrant } = useMaintainer();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [createGrantDialogOpen, setCreateGrantDialogOpen] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<string>('');

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error: {error.message}</div>;

  const filteredRepos = repositories.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         repo.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === "active") {
      return matchesSearch && repo.activeGrants > 0;
    } else if (statusFilter === "no-grants") {
      return matchesSearch && repo.activeGrants === 0;
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Repositories</h1>
        <Button onClick={() => setImportDialogOpen(true)}>
          <GitForkIcon className="mr-2 h-4 w-4" />
          Import Repository
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search repositories..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select 
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Repositories</SelectItem>
            <SelectItem value="active">Active Grants</SelectItem>
            <SelectItem value="no-grants">No Grants</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full">
        {filteredRepos.map((repo) => (
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