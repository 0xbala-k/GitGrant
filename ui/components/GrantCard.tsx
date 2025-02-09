'use client'

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DollarSignIcon,
  UsersIcon,
  CalendarIcon,
  ClockIcon,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Grant {
  id: number;
  title: string;
  description: string;
  amount: number;
  repository: string;
  issueCount: number;
  contributorCount: number;
  deadline: string;
  status: 'active' | 'completed' | 'pending_allocation';
  progress: number;
}

interface GrantCardProps {
  grant: Grant;
  showProgress?: boolean;
}

export function GrantCard({ grant, showProgress = true }: GrantCardProps) {
  const router = useRouter();

  const getBadgeVariant = (status: Grant['status']) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'pending_allocation':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatStatus = (status: Grant['status']): string => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleManageGrant = () => {
    router.push(`/maintainer/grants/${grant.id}`);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{grant.title}</h3>
            <p className="text-sm text-muted-foreground">{grant.repository}</p>
          </div>
          <Badge variant={getBadgeVariant(grant.status)}>
            {formatStatus(grant.status)}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground">{grant.description}</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <DollarSignIcon className="mr-2 h-4 w-4" />
              ${grant.amount.toLocaleString()}
            </div>
            <div className="flex items-center text-sm">
              <UsersIcon className="mr-2 h-4 w-4" />
              {grant.contributorCount} contributors
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {new Date(grant.deadline).toLocaleDateString()}
            </div>
            <div className="flex items-center text-sm">
              <ClockIcon className="mr-2 h-4 w-4" />
              {grant.issueCount} issues
            </div>
          </div>
        </div>

        {showProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{grant.progress}%</span>
            </div>
            <Progress value={grant.progress} />
          </div>
        )}

        <div className="flex space-x-2">
          {grant.status === 'pending_allocation' && (
            <Button 
              className="flex-1"
              onClick={handleManageGrant}
            >
              Allocate Funds
            </Button>
          )}
          {grant.status === 'active' && (
            <Button 
              className="flex-1"
              onClick={handleManageGrant}
            >
              Manage Grant
            </Button>
          )}
          {grant.status === 'completed' && (
            <Button 
              variant="outline"
              className="flex-1"
              onClick={handleManageGrant}
            >
              View Details
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}