'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, LayoutDashboard, FolderOpen, MessageSquare, FileText, Receipt, Calendar, HelpCircle, Settings, LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ClientHeader } from './client-header'
import { ClientFooter } from './client-footer'
import { ClientSidebar, mainNavItems, secondaryNavItems } from './client-sidebar'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar'

interface ClientLayoutProps {
  children: React.ReactNode
}

interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  badge?: number
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Toggle mobile menu
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev)
  }, [])

  // Close mobile menu
  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const allNavItems: NavItem[] = [...mainNavItems, ...secondaryNavItems]

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen flex-col w-full bg-slate-50/50">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <ClientSidebar />
        </div>

        {/* Main content area */}
        <SidebarInset className="flex-1 flex flex-col">
          {/* Header */}
          <ClientHeader
            onMenuToggle={toggleMobileMenu}
            isMobileMenuOpen={isMobileMenuOpen}
          />

          {/* Mobile Navigation Overlay */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-40 bg-black/50 md:hidden"
                  onClick={closeMobileMenu}
                />

                {/* Mobile menu panel */}
                <motion.div
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl md:hidden"
                >
                  {/* Mobile menu header */}
                  <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <Link href="/" className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-slate-800 to-slate-900">
                        <svg
                          className="h-5 w-5 text-emerald-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                          />
                        </svg>
                      </div>
                      <div>
                        <span className="text-lg font-semibold text-slate-900">Sterling</span>
                        <span className="text-lg font-light text-slate-600 ml-1">Law</span>
                      </div>
                    </Link>
                    <button
                      onClick={closeMobileMenu}
                      className="flex items-center justify-center h-9 w-9 rounded-lg text-slate-500 hover:bg-slate-100"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Mobile menu content */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-1">
                      <p className="px-3 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Main Menu
                      </p>
                      {mainNavItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeMobileMenu}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                            pathname === item.href
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          )}
                        >
                          <item.icon
                            className={cn(
                              'h-5 w-5',
                              pathname === item.href ? 'text-emerald-600' : 'text-slate-400'
                            )}
                          />
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      ))}
                    </div>

                    <div className="mt-6 space-y-1">
                      <p className="px-3 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Support
                      </p>
                      {secondaryNavItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeMobileMenu}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                            pathname === item.href
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          )}
                        >
                          <item.icon
                            className={cn(
                              'h-5 w-5',
                              pathname === item.href ? 'text-emerald-600' : 'text-slate-400'
                            )}
                          />
                          <span>{item.title}</span>
                        </Link>
                      ))}
                    </div>

                    {/* Help card */}
                    <div className="mt-6 p-4 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 text-white">
                      <h4 className="font-semibold text-sm mb-1">Need Help?</h4>
                      <p className="text-xs text-slate-300 mb-3">
                        Contact our support team for assistance.
                      </p>
                      <button className="w-full py-2 px-3 text-sm font-medium bg-emerald-500 hover:bg-emerald-600 rounded-md transition-colors">
                        Contact Support
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Page content */}
          <main className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="container mx-auto px-4 md:px-6 lg:px-8 py-6 lg:py-8"
            >
              {children}
            </motion.div>
          </main>

          {/* Footer */}
          <ClientFooter />
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

// Export a simple page wrapper for consistent page layouts
export function ClientPage({ 
  children, 
  title,
  description,
  actions
}: { 
  children: React.ReactNode
  title?: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      {/* Page header */}
      {(title || description || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {title && (
              <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
            )}
            {description && (
              <p className="text-sm text-slate-500 mt-1">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      
      {/* Page content */}
      {children}
    </div>
  )
}
