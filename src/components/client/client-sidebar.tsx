'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  FolderOpen,
  MessageSquare,
  FileText,
  Receipt,
  Calendar,
  HelpCircle,
  Settings,
  Scale,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
} from '@/components/ui/sidebar'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'My Matters',
    href: '/matters',
    icon: FolderOpen,
  },
  {
    title: 'Messages',
    href: '/messages',
    icon: MessageSquare,
    badge: 3,
  },
  {
    title: 'Documents',
    href: '/documents',
    icon: FileText,
  },
  {
    title: 'Invoices',
    href: '/invoices',
    icon: Receipt,
  },
  {
    title: 'Calendar',
    href: '/calendar',
    icon: Calendar,
  },
]

const secondaryNavItems: NavItem[] = [
  {
    title: 'Help & Support',
    href: '/help',
    icon: HelpCircle,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

export function ClientSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r border-slate-200" collapsible="icon">
      <SidebarHeader className="px-3 py-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 w-full">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-800 to-slate-900">
              <Scale className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="flex flex-col sidebar-clip">
              <span className="text-base font-semibold text-slate-900 leading-tight">Sterling</span>
              <span className="text-xs text-slate-500 leading-tight">Client Portal</span>
            </div>
          </Link>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-slate-500 uppercase tracking-wider px-2 mb-2">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      'hover:bg-slate-100',
                      pathname === item.href
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                    tooltip={item.title}
                  >
                    <Link href={item.href} className="flex items-center gap-3 w-full">
                      <item.icon
                        className={cn(
                          'h-5 w-5 shrink-0',
                          pathname === item.href ? 'text-emerald-600' : 'text-slate-400'
                        )}
                      />
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <Badge
                          className={cn(
                            'h-5 min-w-5 px-1.5 justify-center text-xs',
                            pathname === item.href
                              ? 'bg-emerald-600 text-white hover:bg-emerald-600'
                              : 'bg-slate-200 text-slate-600'
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-4 bg-slate-200" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-slate-500 uppercase tracking-wider px-2 mb-2">
            Support
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      'hover:bg-slate-100',
                      pathname === item.href
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                    tooltip={item.title}
                  >
                    <Link href={item.href} className="flex items-center gap-3 w-full">
                      <item.icon
                        className={cn(
                          'h-5 w-5 shrink-0',
                          pathname === item.href ? 'text-emerald-600' : 'text-slate-400'
                        )}
                      />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-200">
        <div className="group-data-[collapsible=icon]:hidden">
          <div className="rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 p-4 text-white">
            <h4 className="font-semibold text-sm mb-1">Need Help?</h4>
            <p className="text-xs text-slate-300 mb-3">
              Contact our support team for assistance with your matters.
            </p>
            <Button
              size="sm"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  )
}

// Export the navigation items for use in mobile menu
export { mainNavItems, secondaryNavItems }
