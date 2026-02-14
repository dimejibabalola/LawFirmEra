"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { StaffLayout } from "@/components/staff/staff-layout"
import { MattersPanel } from "@/components/modules/matters-panel"
import { ClientsPanel } from "@/components/modules/clients-panel"
import { BillingPanel } from "@/components/modules/billing-panel"
import { DocumentsPanel } from "@/components/modules/documents-panel"
import { CalendarPanel } from "@/components/modules/calendar-panel"
import { TasksPanel } from "@/components/modules/tasks-panel"
import { MessagesPanel } from "@/components/modules/messages-panel"
import { CRMPanel } from "@/components/modules/crm-panel"
import { SettingsPanel } from "@/components/modules/settings-panel"
import { ProfilePanel } from "@/components/modules/profile-panel"
import { DashboardOverview } from "@/components/modules/dashboard-panel"
import { useAuthStore, mockCurrentUser } from "@/store"
import { UserAvatar, ATTORNEY_PROFILES } from "@/components/ui/user-avatar"

export default function HomePage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState('dashboard')

  const handleNavigate = useCallback((tabId: string) => {
    setActiveTab(tabId)
  }, [])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />
      case 'matters':
        return <MattersPanel />
      case 'clients':
        return <ClientsPanel />
      case 'billing':
        return <BillingPanel />
      case 'documents':
        return <DocumentsPanel />
      case 'calendar':
        return <CalendarPanel />
      case 'tasks':
        return <TasksPanel />
      case 'messages':
        return <MessagesPanel />
      case 'crm':
        return <CRMPanel />
      case 'profile':
        return <ProfilePanel />
      case 'settings':
        return <SettingsPanel />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <StaffLayout onNavigate={handleNavigate} activeTab={activeTab}>
      {renderContent()}
    </StaffLayout>
  )
}
