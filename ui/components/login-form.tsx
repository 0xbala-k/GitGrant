'use client';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Github } from "lucide-react";
import { useSearchParams } from 'next/navigation';
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const errorMessages: Record<string, string> = {
  'invalid_state': 'Authentication failed: Invalid state',
  'no_code': 'Authentication failed: No code received',
  'authentication_failed': 'Authentication failed. Please try again.',
};

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { login, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: errorMessages[error] || 'An unexpected error occurred',
      });
    }
  }, [searchParams, toast]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center space-y-3">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Login with your Github account and start recieving rewards to your wallet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <Button 
              variant="outline" 
              type="button"
              className="w-full h-12 text-base"
              onClick={login}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Connecting...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Github className="h-5 w-5" />
                  <span>Login with Github</span>
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}