"use client"

import * as React from "react"
import {
  GalleryVerticalEnd,
  Settings2,
  SquareTerminal,
} from "lucide-react"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"

const teams = [
  {
    name: "GitGrant",
    logo: GalleryVerticalEnd,
    plan: "open-source",
  },
  
]

const navMain = [
  {
    title: "Maintainer",
    url: "/dashboard/maintainer",
    icon: SquareTerminal,
    items: [
      {
        title: "Overview",
        url: "dashboard/maintainer",
      },
      {
        title: "Repositories",
        url: "dashboard/maintainer/repositories",
      },
      {
        title: "Grants",
        url: "dashboard/maintainer/grants",
      },
    ],
  },
  {
    title: "Contributor",
    url: "/dashboard/contributor",
    icon: Settings2,
    items: [
      {
        title: "Overview",
        url: "dashboard/contributor",
      },
      {
        title: "Earnings",
        url: "dashboard/contributor/earnings",
      }
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser user={user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}