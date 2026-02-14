"use client"

import * as React from "react"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Search,
  Bell,
  ChevronDown,
  Clock,
  CheckSquare,
  MessageSquare,
  LogOut,
  User,
  Settings,
  Users,
} from "lucide-react"
import { useAuthStore, mockCurrentUser, useNotificationsStore, mockNotifications } from "@/store"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserAvatar, UserNameWithAvatar, ATTORNEY_PROFILES } from "@/components/ui/user-avatar"

// All attorneys for switch functionality
const allAttorneys = Object.entries(ATTORNEY_PROFILES).map(([email, profile]) => ({
  email,
  ...profile
}))

export function StaffHeader() {
  const router = useRouter()
  const { data: session } = useSession()
  const { user, setUser } = useAuthStore()
  const { notifications, unreadCount } = useNotificationsStore()
  
  const currentUser = user || mockCurrentUser
  const profile = currentUser.email ? ATTORNEY_PROFILES[currentUser.email] : null
  const displayName = profile?.name || `${currentUser.firstName} ${currentUser.lastName}`
  const displayRole = profile?.title || currentUser.role
  const currentNotifications = notifications.length > 0 ? notifications : mockNotifications

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/login" })
  }

  const handleSwitchAttorney = (email: string) => {
    const newProfile = ATTORNEY_PROFILES[email]
    if (newProfile) {
      const nameParts = newProfile.name.split(' ')
      setUser({
        ...currentUser,
        email,
        firstName: nameParts[0],
        lastName: nameParts[1] || '',
        role: newProfile.role.toLowerCase() as any,
        department: newProfile.department,
      })
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task-assigned':
        return <CheckSquare className="size-4 text-teal-600" />
      case 'message-received':
        return <MessageSquare className="size-4 text-teal-600" />
      case 'deadline-reminder':
        return <Clock className="size-4 text-amber-500" />
      default:
        return <Bell className="size-4 text-gray-400" />
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b border-gray-200 bg-white/80 backdrop-blur-xl px-4">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search matters, clients, documents..."
            className="h-9 w-full rounded-lg border-0 bg-gray-100 pl-9 pr-4 text-sm placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-teal-500/20"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border border-gray-200 bg-white px-1.5 font-mono text-[10px] font-medium text-gray-400 sm:flex">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="size-9 rounded-lg hover:bg-gray-100 relative"
            >
              <Bell className="size-4 text-gray-600" />
              {unreadCount > 0 && (
                <Badge className="absolute -right-0.5 -top-0.5 size-4 rounded-full bg-teal-600 p-0 text-[10px] font-bold tabular-nums text-white">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            align="end" 
            className="w-80 p-0 rounded-xl shadow-lg border border-gray-200"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h4 className="font-semibold text-sm">Notifications</h4>
              <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-gray-500 hover:text-gray-900">
                Mark all read
              </Button>
            </div>
            <ScrollArea className="h-72">
              <div className="divide-y divide-gray-100">
                {currentNotifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex gap-3 p-3 cursor-pointer transition-colors hover:bg-gray-50",
                      !notification.read && "bg-teal-50/50"
                    )}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="mt-1 size-2 rounded-full bg-teal-600 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="border-t border-gray-100 p-2">
              <Button variant="ghost" size="sm" className="w-full rounded-lg text-xs text-teal-600 hover:text-teal-700 hover:bg-teal-50">
                View all notifications
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-9 gap-2 px-2 rounded-lg hover:bg-gray-100"
            >
              <UserAvatar 
                email={currentUser.email}
                name={displayName}
                size="sm"
              />
              <span className="hidden font-medium text-sm md:inline-block">
                {displayName.split(' ')[0]}
              </span>
              <ChevronDown className="hidden size-3 text-gray-400 md:inline-block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-56 rounded-xl p-1 border border-gray-200 shadow-lg"
          >
            <DropdownMenuLabel className="font-normal p-2">
              <div className="flex items-center gap-3">
                <UserAvatar 
                  email={currentUser.email}
                  name={displayName}
                  size="md"
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900">{displayName}</span>
                  <span className="text-xs text-gray-500">{session?.user?.email || currentUser.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="rounded-lg cursor-pointer"
              onClick={() => {
                // Navigate to profile - this would be handled by parent
              }}
            >
              <User className="mr-2 h-4 w-4" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="rounded-lg cursor-pointer"
              onClick={() => {
                // Navigate to settings
              }}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            
            {/* Switch Attorney */}
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-gray-500 font-normal px-2 py-1.5">
              Switch Attorney
            </DropdownMenuLabel>
            {allAttorneys.map((attorney) => (
              <DropdownMenuItem
                key={attorney.email}
                className="rounded-lg cursor-pointer"
                onClick={() => handleSwitchAttorney(attorney.email)}
              >
                <UserAvatar 
                  email={attorney.email}
                  name={attorney.name}
                  size="sm"
                  className="mr-2"
                />
                <div className="flex flex-col">
                  <span className="text-sm">{attorney.name}</span>
                  <span className="text-xs text-gray-500">{attorney.title}</span>
                </div>
                {currentUser.email === attorney.email && (
                  <Badge className="ml-auto text-[10px] bg-teal-100 text-teal-700">Active</Badge>
                )}
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="rounded-lg cursor-pointer text-red-600 focus:text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
