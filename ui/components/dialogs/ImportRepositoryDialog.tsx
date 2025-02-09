'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LoadingSpinner } from "@/components/loading-spinner";

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(
    /^https?:\/\/github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)(\/.*)?$/
  );
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

const formSchema = z.object({
  url: z
    .string()
    .url("Please enter a valid GitHub repository URL")
    .refine((url) => parseGitHubUrl(url) !== null, {
      message: "The URL must point to a valid GitHub repository",
    }),
});

type ImportRepositoryData = z.infer<typeof formSchema>;

interface ImportRepositoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: { owner: string; repo: string }) => Promise<void>;
}

export function ImportRepositoryDialog({
  open,
  onOpenChange,
  onImport,
}: ImportRepositoryDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ImportRepositoryData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
  });

  const onSubmit = async (data: ImportRepositoryData) => {
    try {
      setIsLoading(true);
      const parsedRepo = parseGitHubUrl(data.url);
      if (!parsedRepo) {
        throw new Error("Failed to parse repository URL");
      }
      await onImport(parsedRepo);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to import repository:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Repository</DialogTitle>
          <DialogDescription>
            Enter the GitHub repository URL to import.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repository URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., https://github.com/facebook/react"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <LoadingSpinner /> : "Import"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}