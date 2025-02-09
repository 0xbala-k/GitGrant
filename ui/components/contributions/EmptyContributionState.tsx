import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GitPullRequestIcon } from "lucide-react";
import Link from "next/link";

export function EmptyContributionState({ message }: { message: string }) {
  return (
    <Card className="p-8 text-center">
      <div className="mx-auto w-fit rounded-full bg-muted p-3">
        <GitPullRequestIcon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 font-semibold">{message}</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Start contributing to open source projects to earn rewards.
      </p>
      <Button className="mt-4" asChild>
        <Link href="/dashboard/contributor/projects">
          Browse Projects
        </Link>
      </Button>
    </Card>
  );
}