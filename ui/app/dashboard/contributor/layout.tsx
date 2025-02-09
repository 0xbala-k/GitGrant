'use client'

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ContributorProvider } from '@/contexts/ContributorContext';

export default function ContributorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <ContributorProvider>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </ContributorProvider>
  );
}