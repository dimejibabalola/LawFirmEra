"use client"

import * as React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { StaffSidebar } from "./sidebar"
import { StaffHeader } from "./header"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { useUIStore } from "@/store"

interface StaffLayoutProps {
  children: React.ReactNode
  onNavigate?: (tabId: string) => void
  activeTab?: string
}

export function StaffLayout({ children, onNavigate, activeTab = 'dashboard' }: StaffLayoutProps) {
  const { sidebarCollapsed } = useUIStore()

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <SidebarProvider defaultOpen={!sidebarCollapsed}>
        <StaffSidebar onNavigate={onNavigate} activeTab={activeTab} />
        <SidebarInset className="flex flex-col min-h-screen bg-gray-50">
          <StaffHeader />
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  )
}
