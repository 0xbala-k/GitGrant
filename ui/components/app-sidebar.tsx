"use client"

import * as React from "react"
import {
  AudioWaveform,
  Command,
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

const data = {
  user: {
    name: "Davanapally Itesh",
    email: "itesh@gitgrant.com",
    avatar: "/avatars/shadcn.jpg",
    id: "user_01"
  },
  teams: [
    {
      name: "GitGrant",
      logo: GalleryVerticalEnd,
      plan: "open-source",
    },
    {
      name: "Langchain",
      logo: AudioWaveform,
      plan: "open-source",
    },
    {
      name: "AgentKit",
      logo: Command,
      plan: "closed-source",
    },
  ],
  navMain: [
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
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
