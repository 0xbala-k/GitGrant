'use client'

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MaintainerProvider } from '@/contexts/MaintainerContext';


export default function MaintainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <MaintainerProvider>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </MaintainerProvider>
  );
}