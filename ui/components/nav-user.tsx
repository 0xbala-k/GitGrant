"use client"

import {
  BadgeCheck,
  ChevronsUpDown,
  CreditCard,
  LogOut,
} from "lucide-react"
import { ConnectWalletDialog } from "./ConnectWalletDialog"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { GitHubUser } from "@/types/auth"

export function NavUser({ user }: { user: GitHubUser }) {
  const router = useRouter()
  const { isMobile } = useSidebar()
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false)
  const { toast } = useToast()
  const { logout } = useAuth()

  const handleLogout = async () => {
    try {
      logout();
      toast({
        title: "User logged out Successfully",
        variant: "default",
      })
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
      toast({
        title: "Failed to logout. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar_url} alt={user.name || user.login} />
                  <AvatarFallback className="rounded-lg">
                    {getInitials(user.name || user.login)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user.name || user.login}
                  </span>
                  <span className="truncate text-xs">
                    {user.email || `@${user.login}`}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar_url} alt={user.name || user.login} />
                    <AvatarFallback className="rounded-lg">
                      {getInitials(user.name || user.login)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user.name || user.login}
                    </span>
                    <span className="truncate text-xs">
                      {user.email || `@${user.login}`}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <BadgeCheck className="mr-2 h-4 w-4" />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => {
                  setIsWalletDialogOpen(true)
                }}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Connect to Web3 wallet
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <ConnectWalletDialog 
        open={isWalletDialogOpen} 
        onOpenChange={setIsWalletDialogOpen}
        userId={user.id.toString()}
      />
    </>
  )
}
