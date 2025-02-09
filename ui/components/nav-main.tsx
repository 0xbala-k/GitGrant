"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

interface NavMainProps {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}

export function NavMain({ items }: NavMainProps) {
  const pathname = usePathname()
  const [openSections, setOpenSections] = useState<string[]>([])

  useEffect(() => {
    const currentSection = items.find(item => 
      item.items?.some(subItem => `/${subItem.url}` === pathname)
    )
    if (currentSection && !openSections.includes(currentSection.title)) {
      setOpenSections(prev => [...prev, currentSection.title])
    }
  }, [pathname, items, openSections])

  const isSubItemActive = (url: string) => `/${url}` === pathname

  const isMainItemActive = (item: NavMainProps['items'][0]) => {
    return item.items?.some(subItem => isSubItemActive(subItem.url))
  }

  const handleCollapsibleChange = (title: string, isOpen: boolean) => {
    setOpenSections(prev => 
      isOpen 
        ? [...prev, title]
        : prev.filter(t => t !== title)
    )
  }

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            open={openSections.includes(item.title)}
            onOpenChange={(isOpen) => handleCollapsibleChange(item.title, isOpen)}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton 
                  tooltip={item.title}
                  className={isMainItemActive(item) ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                >
                  {item.icon && <item.icon className={isMainItemActive(item) ? "text-primary" : ""} />}
                  <span>{item.title}</span>
                  <ChevronRight 
                    className={`ml-auto transition-transform duration-200 
                      ${openSections.includes(item.title) ? "rotate-90" : ""}`}
                  />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton
                        asChild
                        className={isSubItemActive(subItem.url) ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                      >
                        <Link href={`/${subItem.url}`}>
                          <span>{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}