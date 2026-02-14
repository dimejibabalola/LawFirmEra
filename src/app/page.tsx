"use client"

import * as React from "react"
import { useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { StaffLayout } from "@/components/staff/staff-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Briefcase,
  Users,
  Clock,
  DollarSign,
  FileText,
  Calendar,
  CheckSquare,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  LayoutDashboard,
  CreditCard,
  Activity,
  Target,
  Settings,
  User,
} from "lucide-react"
import { motion } from "framer-motion"
import { useAuthStore, mockCurrentUser, mockDashboardStats } from "@/store"
import { cn } from "@/lib/utils"
import { UserAvatar, ATTORNEY_PROFILES } from "@/components/ui/user-avatar"

// Mock data for the dashboard
const recentMatters = [
  { 
    id: '1', 
    title: 'Smith v. Johnson Corp', 
    client: 'Smith Holdings LLC',
    practiceArea: 'Litigation',
    status: 'In Progress', 
    nextDeadline: 'Dec 20, 2024',
    progress: 45,
    hoursLogged: 54,
    hoursEstimated: 120,
  },
  { 
    id: '2', 
    title: 'Merger Agreement - TechStart Inc', 
    client: 'TechStart Inc.',
    practiceArea: 'Corporate',
    status: 'In Progress', 
    nextDeadline: 'Dec 18, 2024',
    progress: 72,
    hoursLogged: 58,
    hoursEstimated: 80,
  },
  { 
    id: '3', 
    title: 'Estate Planning - Williams Family Trust', 
    client: 'Williams Family',
    practiceArea: 'Estate Planning',
    status: 'Pending', 
    nextDeadline: 'Dec 22, 2024',
    progress: 85,
    hoursLogged: 34,
    hoursEstimated: 40,
  },
]

const upcomingEvents = [
  { id: '1', title: 'Deposition - Smith Case', time: '2:00 PM', type: 'deposition', date: 'Today' },
  { id: '2', title: 'Client Meeting - Merger Review', time: '10:00 AM', type: 'meeting', date: 'Tomorrow' },
  { id: '3', title: 'Court Hearing - Motion to Dismiss', time: '9:00 AM', type: 'court', date: 'Dec 3' },
]

const pendingTasks = [
  { id: '1', title: 'Review discovery documents', matter: 'Smith v. Johnson', due: 'Today', priority: 'high' },
  { id: '2', title: 'Draft merger amendments', matter: 'Merger Agreement', due: 'Tomorrow', priority: 'urgent' },
  { id: '3', title: 'Prepare trust documents', matter: 'Williams Trust', due: 'Dec 5', priority: 'medium' },
]

const recentActivity = [
  { id: '1', action: 'Document uploaded', detail: 'Financial statements added', time: '2h ago', user: 'Sarah J.' },
  { id: '2', action: 'Time entry logged', detail: '5.5 hours on Merger Agreement', time: '4h ago', user: 'You' },
  { id: '3', action: 'Status changed', detail: 'Williams Trust moved to Pending', time: 'Yesterday', user: 'Michael C.' },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

function DashboardOverview() {
  const { user } = useAuthStore()
  const currentUser = user || mockCurrentUser
  const profile = currentUser.email ? ATTORNEY_PROFILES[currentUser.email] : null
  const stats = mockDashboardStats

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(amount)
  }

  const metrics = [
    { 
      title: 'Active Matters', 
      value: stats.activeMatters, 
      change: '+3',
      changeType: 'positive' as const,
      icon: Briefcase,
    },
    { 
      title: 'Pending Tasks', 
      value: stats.pendingTasks, 
      change: '5 due today',
      changeType: 'neutral' as const,
      icon: CheckSquare,
    },
    { 
      title: 'Unbilled Hours', 
      value: `${stats.unbilledHours}h`, 
      change: formatCurrency(stats.unbilledAmount),
      changeType: 'positive' as const,
      icon: Clock,
    },
    { 
      title: 'Overdue', 
      value: stats.overdueInvoices, 
      change: formatCurrency(stats.overdueAmount),
      changeType: 'negative' as const,
      icon: DollarSign,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <UserAvatar 
            email={currentUser.email}
            name={profile?.name || currentUser.firstName + " " + currentUser.lastName}
            size="lg"
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Welcome back, {currentUser.firstName}
            </h1>
            <p className="text-gray-500 mt-1">
              {profile?.title || currentUser.role} • {profile?.department || currentUser.department}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-lg border-gray-200">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule
          </Button>
          <Button className="rounded-lg bg-teal-600 hover:bg-teal-700 text-white">
            <Briefcase className="mr-2 h-4 w-4" />
            New Matter
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {metrics.map((metric, i) => (
          <motion.div key={metric.title} variants={item}>
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold tracking-tight text-gray-900">
                      {metric.value}
                    </p>
                    <p className={cn(
                      "text-xs font-medium flex items-center gap-1",
                      metric.changeType === 'positive' && "text-teal-600",
                      metric.changeType === 'negative' && "text-red-600",
                      metric.changeType === 'neutral' && "text-gray-500"
                    )}>
                      {metric.changeType === 'positive' && <TrendingUp className="h-3 w-3" />}
                      {metric.changeType === 'negative' && <TrendingDown className="h-3 w-3" />}
                      {metric.change}
                    </p>
                  </div>
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl",
                    metric.changeType === 'positive' && "bg-teal-50",
                    metric.changeType === 'negative' && "bg-red-50",
                    metric.changeType === 'neutral' && "bg-gray-100"
                  )}>
                    <metric.icon className={cn(
                      "h-6 w-6",
                      metric.changeType === 'positive' && "text-teal-600",
                      metric.changeType === 'negative' && "text-red-600",
                      metric.changeType === 'neutral' && "text-gray-600"
                    )} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Matters */}
        <Card className="lg:col-span-2 border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Recent Matters</CardTitle>
              <CardDescription>Your active cases and their progress</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50">
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMatters.map((matter) => (
                <div key={matter.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 truncate">{matter.title}</p>
                      <Badge variant="outline" className="text-xs">
                        {matter.practiceArea}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{matter.client}</p>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="flex-1">
                        <Progress 
                          value={matter.progress} 
                          className="h-1.5"
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {matter.hoursLogged}/{matter.hoursEstimated}h
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge className={cn(
                      matter.status === 'In Progress' && "bg-blue-50 text-blue-700",
                      matter.status === 'Pending' && "bg-amber-50 text-amber-700",
                    )}>
                      {matter.status}
                    </Badge>
                    <p className="text-xs text-gray-400 mt-1">Due: {matter.nextDeadline}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      event.type === 'deposition' && "bg-purple-50",
                      event.type === 'meeting' && "bg-blue-50",
                      event.type === 'court' && "bg-red-50",
                    )}>
                      <Calendar className={cn(
                        "h-4 w-4",
                        event.type === 'deposition' && "text-purple-600",
                        event.type === 'meeting' && "text-blue-600",
                        event.type === 'court' && "text-red-600",
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                      <p className="text-xs text-gray-500">{event.time} • {event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Pending Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-3">
                    <div className={cn(
                      "mt-0.5 h-2 w-2 rounded-full shrink-0",
                      task.priority === 'urgent' && "bg-red-500",
                      task.priority === 'high' && "bg-amber-500",
                      task.priority === 'medium' && "bg-gray-400",
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-500">{task.matter} • Due {task.due}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <Activity className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.action}</span>
                        <span className="text-gray-500"> - {activity.detail}</span>
                      </p>
                      <p className="text-xs text-gray-400">{activity.time} • {activity.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState('dashboard')

  const handleNavigate = (tabId: string) => {
    setActiveTab(tabId)
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <StaffLayout onNavigate={handleNavigate} activeTab={activeTab}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-gray-100 p-1 rounded-xl mb-6 h-auto flex-wrap gap-1">
          <TabsTrigger value="dashboard" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-600">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="matters" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-600">
            <Briefcase className="mr-2 h-4 w-4" />
            Matters
            <Badge className="ml-1.5 h-5 px-1.5 text-[10px] bg-teal-100 text-teal-700">42</Badge>
          </TabsTrigger>
          <TabsTrigger value="clients" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-600">
            <Users className="mr-2 h-4 w-4" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="billing" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-600">
            <CreditCard className="mr-2 h-4 w-4" />
            Billing
            <Badge className="ml-1.5 h-5 px-1.5 text-[10px] bg-amber-100 text-amber-700">3</Badge>
          </TabsTrigger>
          <TabsTrigger value="documents" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-600">
            <FileText className="mr-2 h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="calendar" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-600">
            <Calendar className="mr-2 h-4 w-4" />
            Calendar
            <Badge className="ml-1.5 h-5 px-1.5 text-[10px] bg-gray-200 text-gray-700">7</Badge>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-600">
            <CheckSquare className="mr-2 h-4 w-4" />
            Tasks
            <Badge className="ml-1.5 h-5 px-1.5 text-[10px] bg-gray-200 text-gray-700">18</Badge>
          </TabsTrigger>
          <TabsTrigger value="messages" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-600">
            <MessageSquare className="mr-2 h-4 w-4" />
            Messages
            <Badge className="ml-1.5 h-5 px-1.5 text-[10px] bg-gray-200 text-gray-700">5</Badge>
          </TabsTrigger>
          <TabsTrigger value="crm" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-600">
            <Target className="mr-2 h-4 w-4" />
            CRM
          </TabsTrigger>
          <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-600">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-600">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-0 focus-visible:ring-0">
          <DashboardOverview />
        </TabsContent>
        
        <TabsContent value="matters" className="mt-0 focus-visible:ring-0">
          <MattersPanel />
        </TabsContent>
        
        <TabsContent value="clients" className="mt-0 focus-visible:ring-0">
          <ClientsPanel />
        </TabsContent>
        
        <TabsContent value="billing" className="mt-0 focus-visible:ring-0">
          <BillingPanel />
        </TabsContent>
        
        <TabsContent value="documents" className="mt-0 focus-visible:ring-0">
          <DocumentsPanel />
        </TabsContent>
        
        <TabsContent value="calendar" className="mt-0 focus-visible:ring-0">
          <CalendarPanel />
        </TabsContent>
        
        <TabsContent value="tasks" className="mt-0 focus-visible:ring-0">
          <TasksPanel />
        </TabsContent>

        <TabsContent value="messages" className="mt-0 focus-visible:ring-0">
          <MessagesPanel />
        </TabsContent>
        
        <TabsContent value="crm" className="mt-0 focus-visible:ring-0">
          <CRMPanel />
        </TabsContent>

        <TabsContent value="profile" className="mt-0 focus-visible:ring-0">
          <ProfilePanel />
        </TabsContent>

        <TabsContent value="settings" className="mt-0 focus-visible:ring-0">
          <SettingsPanel />
        </TabsContent>
      </Tabs>
    </StaffLayout>
  )
}
