import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardFooter, 
    CardHeader, 
    CardTitle } from "@/components/ui/card";
import { CircleIcon, DollarSignIcon, GitForkIcon, StarIcon } from "lucide-react";
import { Button } from "./ui/button";

interface RepoCardProps {
    repo: {
      id: number;
      name: string;
      description: string;
      stars: number;
      forks: number;
      openIssues: number;
      activeGrants: number;
      totalFunding: number;
    };
  }
  
  export function RepoCard({ repo }: RepoCardProps) {
    return (
      <Card className="hover:border-primary/50 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{repo.name}</span>
            <GitForkIcon className="h-5 w-5 text-muted-foreground" />
          </CardTitle>
          <CardDescription>{repo.description}</CardDescription>
        </CardHeader>
        <CardContent>
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
                {repo.openIssues} open issues
              </div>
              <div className="flex items-center text-sm">
                <DollarSignIcon className="mr-2 h-4 w-4" />
                ${repo.totalFunding} funding
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </CardFooter>
      </Card>
    );
  }