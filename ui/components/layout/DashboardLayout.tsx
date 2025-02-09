import React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: {
    items: {
      label: string;
      href?: string;
      isActive?: boolean;
    }[];
  };
}

export function DashboardLayout({ 
  children,
  breadcrumbs 
}: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex">
        <AppSidebar />
        <div className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              {breadcrumbs && (
                <Breadcrumb>
                  <BreadcrumbList>
                    {breadcrumbs.items.map((item, index) => (
                      <React.Fragment key={item.label}>
                        <BreadcrumbItem className="hidden md:block">
                          {item.isActive ? (
                            <BreadcrumbPage>{item.label}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink href={item.href}>
                              {item.label}
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                        {index < breadcrumbs.items.length - 1 && (
                          <BreadcrumbSeparator className="hidden md:block" />
                        )}
                      </React.Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              )}
            </div>
          </header>
          <main className="p-8 w-full">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}