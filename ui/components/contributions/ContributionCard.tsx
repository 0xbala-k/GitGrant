import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  GitPullRequestIcon,
  AlertCircleIcon,
} from "lucide-react";

export interface Contribution {
  id: number;
  title: string;
  description: string;
  repository: string;
  type: 'bug' | 'feature' | 'documentation';
  status: 'in_progress' | 'under_review' | 'completed' | 'rejected';
  reward: number;
  submittedDate: string;
  completedDate?: string;
  prLink: string;
}

const getStatusColor = (status: Contribution['status']) => {
  switch (status) {
    case 'completed':
      return 'success' as const;
    case 'in_progress':
      return 'default' as const;
    case 'under_review':
      return 'warning' as const;
    case 'rejected':
      return 'destructive' as const;
    default:
      return 'secondary' as const;
  }
};

const getStatusIcon = (status: Contribution['status']) => {
  switch (status) {
    case 'completed':
      return <CheckCircleIcon className="h-4 w-4" />;
    case 'in_progress':
      return <ClockIcon className="h-4 w-4" />;
    case 'under_review':
      return <GitPullRequestIcon className="h-4 w-4" />;
    case 'rejected':
      return <AlertCircleIcon className="h-4 w-4" />;
    default:
      return null;
  }
};

export function ContributionCard({ contribution }: { contribution: Contribution }) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{contribution.title}</h3>
              <Badge variant={getStatusColor(contribution.status)}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(contribution.status)}
                  {contribution.status.replace('_', ' ').toUpperCase()}
                </span>
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {contribution.repository}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">${contribution.reward}</p>
            <Badge variant="secondary">{contribution.type}</Badge>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {contribution.description}
        </p>

        <div className="flex justify-between text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span>Submitted: {new Date(contribution.submittedDate).toLocaleDateString()}</span>
            </div>
            {contribution.completedDate && (
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
                <span>Completed: {new Date(contribution.completedDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={contribution.prLink} target="_blank" rel="noopener noreferrer">
                View PR
              </a>
            </Button>
            <Button size="sm">View Details</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}