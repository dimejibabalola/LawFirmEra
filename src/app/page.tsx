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
} from "lucide-react"
import { motion } from "framer-motion"
import { useAuthStore, mockCurrentUser, mockDashboardStats } from "@/store"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"

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
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Welcome back, {currentUser.firstName}
          </h1>
          <p className="text-gray-500 mt-1">
            Here&apos;s what&apos;s happening with your practice today
          </p>
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
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                    <metric.icon className="h-5 w-5 text-gray-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Matters */}
        <motion.div variants={item} initial="hidden" animate="show" className="lg:col-span-2">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-semibold text-gray-900">Recent Matters</CardTitle>
                <CardDescription className="text-gray-500">Your most active legal matters</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentMatters.map((matter) => (
                  <div
                    key={matter.id}
                    className="group flex items-center gap-4 rounded-lg border border-gray-200 p-4 transition-all hover:border-teal-200 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate text-gray-900">{matter.title}</p>
                        <Badge variant="secondary" className="ml-2 shrink-0 text-xs font-medium bg-gray-100 text-gray-700">
                          {matter.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{matter.client}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {matter.nextDeadline}
                        </span>
                        <span>{matter.practiceArea}</span>
                        <span>{matter.hoursLogged}h / {matter.hoursEstimated}h</span>
                      </div>
                    </div>
                    <div className="hidden sm:block w-24">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Progress</span>
                        <span className="font-medium text-gray-700">{matter.progress}%</span>
                      </div>
                      <Progress value={matter.progress} className="h-1.5" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Upcoming */}
          <motion.div variants={item} initial="hidden" animate="show">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-gray-50 cursor-pointer"
                    >
                      <div className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        event.type === 'deposition' && "bg-amber-100 text-amber-600",
                        event.type === 'meeting' && "bg-teal-100 text-teal-600",
                        event.type === 'court' && "bg-red-100 text-red-600"
                      )}>
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-gray-900">{event.title}</p>
                        <p className="text-xs text-gray-400">
                          {event.date} • {event.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tasks */}
          <motion.div variants={item} initial="hidden" animate="show">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900">
                  <CheckSquare className="h-4 w-4 text-gray-400" />
                  Pending Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pendingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 rounded-lg border border-gray-200 p-2.5 transition-colors hover:bg-gray-50 cursor-pointer"
                    >
                      <div className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        task.priority === 'urgent' && "bg-red-500",
                        task.priority === 'high' && "bg-orange-500",
                        task.priority === 'medium' && "bg-amber-500"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-gray-900">{task.title}</p>
                        <p className="text-xs text-gray-400 truncate">{task.matter}</p>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">{task.due}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Activity */}
      <motion.div variants={item} initial="hidden" animate="show">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900">
              <Activity className="h-4 w-4 text-gray-400" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col divide-y divide-gray-100">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                    {activity.user.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium text-gray-900">{activity.user}</span>
                      <span className="text-gray-500"> — {activity.action}</span>
                    </p>
                    <p className="text-xs text-gray-400 truncate">{activity.detail}</p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function LawFirmPlatform() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const handleNavigate = (tabId: string) => {
    setActiveTab(tabId)
  }

  return (
    <StaffLayout onNavigate={handleNavigate} activeTab={activeTab}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-100 p-1 h-auto flex-wrap gap-1 rounded-xl border border-gray-200">
          <TabsTrigger value="dashboard" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-600">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="matters" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-600">
            <Briefcase className="mr-2 h-4 w-4" />
            Matters
            <Badge className="ml-1.5 h-5 px-1.5 text-[10px] bg-gray-200 text-gray-700">42</Badge>
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
      </Tabs>
    </StaffLayout>
  )
}
