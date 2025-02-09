import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function DashboardPage() {
  const breadcrumbs = {
    items: [
      {
        label: "Dashboard",
        isActive: true,
      },
    ],
  };

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border p-8 text-center">
            <h2 className="text-lg font-semibold">Welcome!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This is your dashboard. Content will be added soon.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}