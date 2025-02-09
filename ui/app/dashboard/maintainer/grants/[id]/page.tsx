'use client'

import { useParams, useRouter } from "next/navigation";
import { useMaintainer } from "@/contexts/MaintainerContext";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DollarSignIcon,
  UsersIcon,
  CalendarIcon,
  ArrowLeftIcon,
  ClockIcon,
  GitForkIcon,
  StarIcon,
  CircleIcon,
  AlertCircleIcon,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function GrantManagementPage() {
  const params = useParams();
  const router = useRouter();
  const { grants, repositories, isLoading } = useMaintainer();
  
  if (isLoading) return <LoadingSpinner />;

  const grant = grants.find(g => g.id.toString() === params.id);
  if (!grant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Grant not found. The grant you&apos;re looking for might have been deleted or doesn&apos;t exist.
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          onClick={() => router.push('/maintainer/grants')}
        >
          Return to Grants
        </Button>
      </div>
    );
  }

  const repository = repositories.find(r => r.name === grant.repository);
  if (!repository) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Associated repository not found. The repository might have been removed.
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          onClick={() => router.push('/maintainer/grants')}
        >
          Return to Grants
        </Button>
      </div>
    );
  }

  const formatStatus = (status: string): string => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getBadgeVariant = (status: string) => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push('/maintainer/grants')}
          className="gap-2"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Grants
        </Button>
        <h1 className="text-3xl font-bold">{grant.title}</h1>
        <Badge variant={getBadgeVariant(grant.status)}>
          {formatStatus(grant.status)}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Repository Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <StarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Stars:</span>
                  <span className="ml-2 font-medium">{repository.stars}</span>
                </div>
                <div className="flex items-center text-sm">
                  <GitForkIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Forks:</span>
                  <span className="ml-2 font-medium">{repository.forks}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <CircleIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Open Issues:</span>
                  <span className="ml-2 font-medium">{repository.openIssues}</span>
                </div>
                <div className="flex items-center text-sm">
                  <DollarSignIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Total Funding:</span>
                  <span className="ml-2 font-medium">${repository.totalFunding}</span>
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.open(`https://github.com/${repository.name}`, '_blank')}
            >
              <GitForkIcon className="mr-2 h-4 w-4" />
              View Repository on GitHub
            </Button>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Grant Details</h2>
            <p className="text-sm text-muted-foreground">{grant.description}</p>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">${grant.amount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Contributors:</span>
                <span className="font-medium">{grant.contributorCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Deadline:</span>
                <span className="font-medium">
                  {new Date(grant.deadline).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm font-medium">{grant.progress}%</span>
              </div>
              <Progress value={grant.progress} />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Actions</h2>
            <div className="space-y-4">
              {grant.status === 'pending_allocation' && (
                <Button className="w-full">
                  <DollarSignIcon className="mr-2 h-4 w-4" />
                  Allocate Funds
                </Button>
              )}
              {grant.status === 'active' && (
                <>
                  <Button className="w-full">
                    <UsersIcon className="mr-2 h-4 w-4" />
                    Manage Contributors
                  </Button>
                  <Button variant="outline" className="w-full">
                    <ClockIcon className="mr-2 h-4 w-4" />
                    Extend Deadline
                  </Button>
                </>
              )}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open(`https://github.com/${repository.name}/issues`, '_blank')}
              >
                <CircleIcon className="mr-2 h-4 w-4" />
                View Issues on GitHub
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Associated Issues</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Issue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">#{grant.issueCount}</TableCell>
                  <TableCell>
                    <Badge variant="outline">Open</Badge>
                  </TableCell>
                  <TableCell>Unassigned</TableCell>
                  <TableCell>{new Date().toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.open(`https://github.com/${repository.name}/issues/${grant.issueCount}`, '_blank')}
                    >
                      View on GitHub
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}