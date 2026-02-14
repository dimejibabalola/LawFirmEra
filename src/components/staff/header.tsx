"use client"

import * as React from "react"
import { signOut, useSession } from "next-auth/react"
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
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Search,
  Bell,
  Clock,
  CheckSquare,
  MessageSquare,
  LogOut,
  User,
  Settings,
  Briefcase,
  FileText,
  Users,
} from "lucide-react"
import { useAuthStore, mockCurrentUser, useNotificationsStore, mockNotifications } from "@/store"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserAvatar, ATTORNEY_PROFILES } from "@/components/ui/user-avatar"

// All attorneys for switch functionality
const allAttorneys = Object.entries(ATTORNEY_PROFILES).map(([email, profile]) => ({
  email,
  ...profile
}))

// Mock data for global search
const searchableData = {
  matters: [
    { id: '1', title: 'Smith v. Johnson Corp', type: 'matter', client: 'Smith Holdings LLC', status: 'In Progress' },
    { id: '2', title: 'Merger Agreement - TechStart Inc', type: 'matter', client: 'TechStart Inc.', status: 'In Progress' },
    { id: '3', title: 'Estate Planning - Williams Family Trust', type: 'matter', client: 'Williams Family', status: 'Pending' },
    { id: '4', title: 'Patent Application - GreenTech', type: 'matter', client: 'GreenTech Solutions', status: 'Draft' },
    { id: '5', title: 'Real Estate Acquisition - 500 Grant St', type: 'matter', client: 'Property Holdings LLC', status: 'Open' },
  ],
  clients: [
    { id: '1', name: 'Smith Holdings LLC', type: 'client', email: 'robert@smithholdings.com', industry: 'Real Estate' },
    { id: '2', name: 'TechStart Inc.', type: 'client', email: 'jennifer@techstart.io', industry: 'Technology' },
    { id: '3', name: 'Williams Family', type: 'client', email: 'william.williams@email.com', industry: 'Individual' },
    { id: '4', name: 'GreenTech Solutions', type: 'client', email: 'info@greentech.com', industry: 'Clean Energy' },
    { id: '5', name: 'Taylor Industries', type: 'client', email: 'elizabeth@taylorind.com', industry: 'Manufacturing' },
  ],
  documents: [
    { id: '1', title: 'Merger Agreement Draft v3', type: 'document', matter: 'Merger Agreement', date: '2024-11-28' },
    { id: '2', title: 'Williams Trust Document', type: 'document', matter: 'Estate Planning', date: '2024-11-27' },
    { id: '3', title: 'Patent Application Filing', type: 'document', matter: 'Patent Application', date: '2024-11-26' },
    { id: '4', title: 'Settlement Offer Letter', type: 'document', matter: 'Smith v. Johnson Corp', date: '2024-11-25' },
    { id: '5', title: 'Property Purchase Agreement', type: 'document', matter: 'Real Estate Acquisition', date: '2024-11-24' },
  ],
  messages: [
    { id: '1', title: 'Merger Agreement Review', type: 'message', from: 'Sarah Johnson', preview: 'I\'ve reviewed the amendments...' },
    { id: '2', title: 'Williams Trust Documents', type: 'message', from: 'Michael Chen', preview: 'The trust documents are ready...' },
    { id: '3', title: 'Patent Research', type: 'message', from: 'Emily Williams', preview: 'Prior art search completed...' },
  ],
}

export function StaffHeader() {
  const { data: session } = useSession()
  const { user, setUser } = useAuthStore()
  const { notifications, unreadCount } = useNotificationsStore()
  
  const currentUser = user || mockCurrentUser
  const profile = currentUser.email ? ATTORNEY_PROFILES[currentUser.email] : null
  const displayName = profile?.name || `${currentUser.firstName} ${currentUser.lastName}`
  const currentNotifications = notifications.length > 0 ? notifications : mockNotifications
  
  const [commandOpen, setCommandOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

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

  // Filter search results
  const filteredMatters = searchableData.matters.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.client.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredClients = searchableData.clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredDocuments = searchableData.documents.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredMessages = searchableData.messages.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.from.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b border-gray-200 bg-white px-6">
        {/* Search - Command Palette Trigger */}
        <div className="flex-1 max-w-xl">
          <Button
            variant="outline"
            className="w-full justify-start text-muted-foreground sm:pr-12 h-9 bg-gray-50 border-0 hover:bg-gray-100"
            onClick={() => setCommandOpen(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline-flex">Search matters, clients, documents, messages...</span>
            <span className="inline-flex lg:hidden">Search...</span>
            <kbd className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>

        {/* Right side - minimal */}
        <div className="flex items-center gap-2 ml-auto">
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

          {/* User Menu - pushed far right */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-9 gap-2 px-3 rounded-lg hover:bg-gray-100 ml-2"
              >
                <UserAvatar 
                  email={currentUser.email}
                  name={displayName}
                  size="sm"
                />
                <span className="hidden font-medium text-sm xl:inline-block">
                  {displayName.split(' ')[0]}
                </span>
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
              <DropdownMenuItem className="rounded-lg cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg cursor-pointer">
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

      {/* Command Palette - Global Search */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput 
          placeholder="Search matters, clients, documents, messages..." 
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList className="max-h-[400px]">
          <CommandEmpty>No results found.</CommandEmpty>
          
          {filteredMatters.length > 0 && (
            <CommandGroup heading="Matters">
              {filteredMatters.map((matter) => (
                <CommandItem key={matter.id} className="cursor-pointer">
                  <Briefcase className="mr-2 h-4 w-4 text-teal-600" />
                  <div className="flex flex-col">
                    <span>{matter.title}</span>
                    <span className="text-xs text-gray-500">{matter.client}</span>
                  </div>
                  <Badge variant="outline" className="ml-auto text-xs">{matter.status}</Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          
          {filteredClients.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Clients">
                {filteredClients.map((client) => (
                  <CommandItem key={client.id} className="cursor-pointer">
                    <Users className="mr-2 h-4 w-4 text-blue-600" />
                    <div className="flex flex-col">
                      <span>{client.name}</span>
                      <span className="text-xs text-gray-500">{client.industry}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
          
          {filteredDocuments.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Documents">
                {filteredDocuments.map((doc) => (
                  <CommandItem key={doc.id} className="cursor-pointer">
                    <FileText className="mr-2 h-4 w-4 text-amber-600" />
                    <div className="flex flex-col">
                      <span>{doc.title}</span>
                      <span className="text-xs text-gray-500">{doc.matter}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
          
          {filteredMessages.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Messages">
                {filteredMessages.map((msg) => (
                  <CommandItem key={msg.id} className="cursor-pointer">
                    <MessageSquare className="mr-2 h-4 w-4 text-green-600" />
                    <div className="flex flex-col">
                      <span>{msg.title}</span>
                      <span className="text-xs text-gray-500">From: {msg.from}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
