'use client'

import { useMaintainer } from "@/contexts/MaintainerContext";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GrantCard } from "@/components/GrantCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSignIcon,
  SearchIcon,
  PlusCircleIcon,
  CalendarIcon,
  UsersIcon,
  ClockIcon,
} from "lucide-react";
import { useState } from "react";
import { CreateGrantDialog } from "@/components/dialogs/CreateGrantDialog";

export default function GrantsPage() {
  const { grants, repositories, isLoading, error, createGrant } = useMaintainer();
  const [searchQuery, setSearchQuery] = useState("");
  const [repoFilter, setRepoFilter] = useState("all");
  const [createGrantDialogOpen, setCreateGrantDialogOpen] = useState(false);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error: {error.message}</div>;

  const activeGrants = grants.filter(grant => grant.status === 'active');
  const completedGrants = grants.filter(grant => grant.status === 'completed');

  const filterGrants = (grantsList: typeof grants) => {
    return grantsList.filter(grant => {
      const matchesSearch = grant.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           grant.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRepo = repoFilter === "all" || grant.repository === repoFilter;
      return matchesSearch && matchesRepo;
    });
  };

  const filteredActiveGrants = filterGrants(activeGrants);
  const filteredCompletedGrants = filterGrants(completedGrants);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Grants</h1>
        <Button onClick={() => setCreateGrantDialogOpen(true)}>
          <PlusCircleIcon className="mr-2 h-4 w-4" />
          Create New Grant
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <DollarSignIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Active Funding</p>
              <h3 className="text-2xl font-bold">
                ${activeGrants.reduce((sum, grant) => sum + grant.amount, 0).toLocaleString()}
              </h3>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <UsersIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Contributors</p>
              <h3 className="text-2xl font-bold">
                {activeGrants.reduce((sum, grant) => sum + grant.contributorCount, 0)}
              </h3>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <ClockIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Open Issues</p>
              <h3 className="text-2xl font-bold">
                {activeGrants.reduce((sum, grant) => sum + grant.issueCount, 0)}
              </h3>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <CalendarIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed Grants</p>
              <h3 className="text-2xl font-bold">
                {completedGrants.length}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Grants</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search grants..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={repoFilter}
            onValueChange={setRepoFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by repository" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Repositories</SelectItem>
              {repositories.map((repo) => (
                <SelectItem key={repo.id} value={repo.name}>
                  {repo.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {filteredActiveGrants.map((grant) => (
              <GrantCard key={grant.id} grant={grant} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {filteredCompletedGrants.map((grant) => (
              <GrantCard key={grant.id} grant={grant} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
      <CreateGrantDialog
        open={createGrantDialogOpen}
        onOpenChange={setCreateGrantDialogOpen}
        onSubmit={createGrant}
        repositories={repositories}
      />
    </div>
  );
}
