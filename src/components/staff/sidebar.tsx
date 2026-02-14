"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Briefcase,
  Users,
  CreditCard,
  FileText,
  Calendar,
  CheckSquare,
  MessageSquare,
  Settings,
  ChevronUp,
  Scale,
  LogOut,
  Target,
  User,
  CalendarClock,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAuthStore, mockCurrentUser } from "@/store"
import { UserAvatar, ATTORNEY_PROFILES } from "@/components/ui/user-avatar"

// Navigation items
const navItems = [
  { id: 'dashboard', title: 'Dashboard', icon: LayoutDashboard, badge: undefined },
  { id: 'matters', title: 'Matters', icon: Briefcase, badge: 42 },
  { id: 'clients', title: 'Clients', icon: Users, badge: undefined },
  { id: 'crm', title: 'CRM', icon: Target, badge: undefined },
  { id: 'billing', title: 'Billing', icon: CreditCard, badge: 3 },
  { id: 'documents', title: 'Documents', icon: FileText, badge: undefined },
  { id: 'calendar', title: 'Calendar', icon: Calendar, badge: 7 },
  { id: 'scheduling', title: 'Scheduling', icon: CalendarClock, badge: undefined },
  { id: 'tasks', title: 'Tasks', icon: CheckSquare, badge: 18 },
  { id: 'messages', title: 'Messages', icon: MessageSquare, badge: 5 },
]

const secondaryNavItems = [
  { id: 'profile', title: 'Profile', icon: User },
  { id: 'settings', title: 'Settings', icon: Settings },
]

interface StaffSidebarProps {
  onNavigate?: (tabId: string) => void
  activeTab?: string
}

export function StaffSidebar({ onNavigate, activeTab = 'dashboard' }: StaffSidebarProps) {
  const { state } = useSidebar()
  const { user } = useAuthStore()
  
  const currentUser = user || mockCurrentUser
  const profile = currentUser.email ? ATTORNEY_PROFILES[currentUser.email] : null
  const displayName = profile?.name || `${currentUser.firstName} ${currentUser.lastName}`
  const displayRole = profile?.title || currentUser.role
  const isCollapsed = state === "collapsed"

  const handleNavigation = (tabId: string) => {
    onNavigate?.(tabId)
  }

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-gray-200 bg-white"
    >
      {/* Header with Logo */}
      <SidebarHeader className="border-b border-gray-100">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={() => handleNavigation('dashboard')}
              className="cursor-pointer group"
            >
              <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-teal-600 text-white shadow-lg shadow-teal-600/20">
                <Scale className="size-5" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold tracking-tight text-gray-900">
                  LegalFlow
                </span>
                <span className="truncate text-xs text-gray-500 font-normal">
                  Practice Management
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent className="scrollbar-elegant">
        <SidebarGroup>
          <SidebarGroupLabel className={cn(
            "text-xs font-semibold uppercase tracking-wider text-gray-400",
            isCollapsed && "sr-only"
          )}>
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => handleNavigation(item.id)}
                      isActive={isActive}
                      tooltip={isCollapsed ? item.title : undefined}
                      className={cn(
                        "h-10 px-3 rounded-lg transition-all duration-200",
                        "hover:bg-gray-100",
                        isActive && [
                          "bg-teal-50 text-teal-700 font-medium",
                          "border-l-2 border-teal-600 ml-0 pl-[calc(0.75rem-2px)]"
                        ]
                      )}
                    >
                      <Icon className={cn(
                        "size-[18px] shrink-0",
                        isActive ? "text-teal-600" : "text-gray-400"
                      )} />
                      {!isCollapsed && (
                        <>
                          <span className="truncate text-gray-700">{item.title}</span>
                          {item.badge !== undefined && (
                            <Badge 
                              className={cn(
                                "ml-auto h-5 min-w-5 rounded-full px-1.5 text-[10px] font-semibold tabular-nums",
                                isActive 
                                  ? "bg-teal-600 text-white" 
                                  : "bg-gray-100 text-gray-600"
                              )}
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="my-2 h-px bg-gray-100 mx-2" />

        {/* Secondary Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={cn(
            "text-xs font-semibold uppercase tracking-wider text-gray-400",
            isCollapsed && "sr-only"
          )}>
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => handleNavigation(item.id)}
                      isActive={isActive}
                      tooltip={isCollapsed ? item.title : undefined}
                      className={cn(
                        "h-10 px-3 rounded-lg transition-all duration-200",
                        "hover:bg-gray-100",
                        isActive && "bg-gray-100 text-gray-900"
                      )}
                    >
                      <Icon className="size-[18px] shrink-0 text-gray-400" />
                      {!isCollapsed && (
                        <span className="truncate text-gray-700">{item.title}</span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions - only when expanded */}
        {!isCollapsed && (
          <SidebarGroup className="mt-auto">
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 mx-1">
              <p className="text-xs font-medium text-gray-500 mb-2">Quick Actions</p>
              <div className="grid grid-cols-3 gap-1">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-full p-0 hover:bg-gray-100 text-gray-500"
                  onClick={() => handleNavigation('matters')}
                >
                  <Briefcase className="size-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-full p-0 hover:bg-gray-100 text-gray-500"
                  onClick={() => handleNavigation('tasks')}
                >
                  <CheckSquare className="size-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-full p-0 hover:bg-gray-100 text-gray-500"
                  onClick={() => handleNavigation('calendar')}
                >
                  <Calendar className="size-4" />
                </Button>
              </div>
            </div>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* User Footer - Flush left aligned */}
      <SidebarFooter className="border-t border-gray-100 p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors text-left",
                isCollapsed && "justify-center p-2"
              )}
            >
              <UserAvatar 
                email={currentUser.email}
                name={displayName}
                size="md"
              />
              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {displayRole}
                    </p>
                  </div>
                  <ChevronUp className="size-4 text-gray-400 shrink-0" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 min-w-56 rounded-xl p-1 border border-gray-200 shadow-lg"
            side="top"
            align="start"
            sideOffset={4}
          >
            <DropdownMenuItem 
              onClick={() => handleNavigation('profile')}
              className="cursor-pointer rounded-lg"
            >
              <User className="mr-2 size-4" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleNavigation('settings')}
              className="cursor-pointer rounded-lg"
            >
              <Settings className="mr-2 size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer rounded-lg text-red-600 focus:text-red-600">
              <LogOut className="mr-2 size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
