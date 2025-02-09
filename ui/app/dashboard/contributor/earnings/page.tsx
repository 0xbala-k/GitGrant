'use client'

import { useContributor } from "@/contexts/ContributorContext";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GitPullRequestIcon, SearchIcon, DollarSignIcon } from "lucide-react";
import { useState } from "react";

export default function EarningsPage() {
  const { contributions, isLoading, error } = useContributor();
  const [searchQuery, setSearchQuery] = useState("");

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error: {error.message}</div>;

  const filteredContributions = contributions.filter(contribution =>
    contribution.repository.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contribution.issueTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalEarnings = filteredContributions.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Earnings</h1>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total Earnings:</span>
            <span className="font-bold">${totalEarnings.toLocaleString()}</span>
          </div>
        </Card>
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search contributions..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredContributions.map((contribution) => (
          <Card key={contribution.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <GitPullRequestIcon className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">{contribution.repository}</h3>
                  <span className="text-sm text-muted-foreground">
                    #{contribution.issueNumber}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {contribution.issueTitle}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Reward</p>
                  <p className="font-semibold">${contribution.amount}</p>
                </div>
                <Button
                  variant="outline"
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
  );
}