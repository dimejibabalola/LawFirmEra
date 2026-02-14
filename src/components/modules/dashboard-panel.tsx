"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Briefcase,
  Clock,
  DollarSign,
  CheckSquare,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertCircle,
  Calendar,
} from "lucide-react"
import { motion } from "framer-motion"
import { 
  useAuthStore, 
  mockCurrentUser, 
  mockDashboardStats 
} from "@/store"

// Mock data for the dashboard
const recentMatters = [
  { 
    id: '1', 
    title: 'Smith v. Johnson Corp', 
    client: 'Smith Holdings LLC',
    practiceArea: 'litigation',
    status: 'in-discovery' as const, 
    nextDeadline: '2024-12-20',
    progress: 45 
  },
  { 
    id: '2', 
    title: 'Merger Agreement - TechStart Inc', 
    client: 'TechStart Inc.',
    practiceArea: 'corporate',
    status: 'in-negotiation' as const, 
    nextDeadline: '2024-12-18',
    progress: 72 
  },
  { 
    id: '3', 
    title: 'Estate Planning - Williams Family Trust', 
    client: 'Williams Family',
    practiceArea: 'estate-planning',
    status: 'pending' as const, 
    nextDeadline: '2024-12-22',
    progress: 85 
  },
]

const upcomingEvents = [
  { id: '1', title: 'Deposition - Smith Case', date: 'Today, 2:00 PM', type: 'deposition', matter: 'Smith v. Johnson Corp' },
  { id: '2', title: 'Client Meeting - Merger Review', date: 'Tomorrow, 10:00 AM', type: 'meeting', matter: 'Merger Agreement' },
  { id: '3', title: 'Court Hearing - Motion to Dismiss', date: 'Dec 20, 2024', type: 'court-hearing', matter: 'Smith v. Johnson Corp' },
  { id: '4', title: 'Document Filing Deadline', date: 'Dec 22, 2024', type: 'deadline', matter: 'Williams Trust' },
]

const pendingTasks = [
  { id: '1', title: 'Review discovery documents', matter: 'Smith v. Johnson Corp', dueDate: 'Today', priority: 'high' as const },
  { id: '2', title: 'Draft merger agreement amendments', matter: 'Merger Agreement', dueDate: 'Tomorrow', priority: 'urgent' as const },
  { id: '3', title: 'Prepare trust documents', matter: 'Williams Trust', dueDate: 'Dec 22', priority: 'medium' as const },
]

const recentActivity = [
  { id: '1', action: 'Document uploaded', description: 'Financial statements added to Smith case', time: '2 hours ago', user: 'Sarah J.' },
  { id: '2', action: 'Time entry logged', description: '5.5 hours on Merger Agreement review', time: '4 hours ago', user: 'You' },
  { id: '3', action: 'Status changed', description: 'Williams Trust moved to Pending Review', time: 'Yesterday', user: 'Michael C.' },
]

const statusColors: Record<string, string> = {
  'new': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  'open': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  'pending': 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  'in-discovery': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  'in-negotiation': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  'in-litigation': 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  'settled': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  'closed': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

const priorityColors: Record<string, string> = {
  'low': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  'medium': 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  'high': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  'urgent': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
}

const eventTypeColors: Record<string, string> = {
  'meeting': 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400',
  'deposition': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  'court-hearing': 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400',
  'deadline': 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
}

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

export function DashboardOverview() {
  const { user } = useAuthStore()
  const currentUser = user || mockCurrentUser
  const stats = mockDashboardStats

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Welcome back, {currentUser.firstName}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Here&apos;s what&apos;s happening with your practice today
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-200 dark:border-slate-700">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Briefcase className="mr-2 h-4 w-4" />
            New Matter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { 
            title: 'Active Matters', 
            value: stats.activeMatters, 
            icon: Briefcase, 
            iconBg: 'bg-emerald-100 dark:bg-emerald-900',
            iconColor: 'text-emerald-600 dark:text-emerald-400',
            change: '+3 this month',
            trend: 'up'
          },
          { 
            title: 'Pending Tasks', 
            value: stats.pendingTasks, 
            icon: CheckSquare, 
            iconBg: 'bg-amber-100 dark:bg-amber-900',
            iconColor: 'text-amber-600 dark:text-amber-400',
            change: '5 due today',
            trend: 'down'
          },
          { 
            title: 'Unbilled Hours', 
            value: `${stats.unbilledHours}h`, 
            icon: Clock, 
            iconBg: 'bg-slate-100 dark:bg-slate-800',
            iconColor: 'text-slate-600 dark:text-slate-400',
            change: formatCurrency(stats.unbilledAmount),
            trend: 'up'
          },
          { 
            title: 'Overdue Invoices', 
            value: stats.overdueInvoices, 
            icon: DollarSign, 
            iconBg: 'bg-red-100 dark:bg-red-900',
            iconColor: 'text-red-600 dark:text-red-400',
            change: formatCurrency(stats.overdueAmount),
            trend: 'down'
          },
        ].map((stat) => (
          <motion.div key={stat.title} variants={item}>
            <Card className="border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-1">
                      {stat.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-amber-500" />
                      )}
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-2.5 rounded-lg ${stat.iconBg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
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
        <motion.div 
          variants={item}
          initial="hidden"
          animate="show"
          className="lg:col-span-2"
        >
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg text-slate-900 dark:text-slate-100">
                  Recent Matters
                </CardTitle>
                <CardDescription>Your most active legal matters</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentMatters.map((matter) => (
                  <motion.div
                    key={matter.id}
                    whileHover={{ scale: 1.005 }}
                    className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                          {matter.title}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                          {matter.client}
                        </p>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`ml-2 shrink-0 capitalize ${statusColors[matter.status]}`}
                      >
                        {matter.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(matter.nextDeadline).toLocaleDateString()}
                      </span>
                      <span className="capitalize">{matter.practiceArea.replace('-', ' ')}</span>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                        <span>Progress</span>
                        <span>{matter.progress}%</span>
                      </div>
                      <Progress 
                        value={matter.progress} 
                        className="h-1.5 bg-slate-100 dark:bg-slate-800"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <motion.div variants={item} initial="hidden" animate="show">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Calendar className="h-5 w-5 text-slate-400" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <div className={`mt-0.5 p-1.5 rounded ${eventTypeColors[event.type]}`}>
                        <Calendar className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                          {event.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {event.date}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                          {event.matter}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pending Tasks */}
          <motion.div variants={item} initial="hidden" animate="show">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <CheckSquare className="h-5 w-5 text-slate-400" />
                  Pending Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer"
                    >
                      <div className={`mt-0.5 w-2 h-2 rounded-full ${
                        task.priority === 'urgent' ? 'bg-red-500' :
                        task.priority === 'high' ? 'bg-orange-500' :
                        task.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {task.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {task.matter}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${priorityColors[task.priority]}`}
                          >
                            {task.priority}
                          </Badge>
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            Due: {task.dueDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Recent Activity */}
      <motion.div 
        variants={item}
        initial="hidden"
        animate="show"
      >
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-slate-900 dark:text-slate-100">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm font-medium">
                    {activity.user.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 dark:text-slate-100">
                      <span className="font-medium">{activity.user}</span>
                      {' '}- {activity.action}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Alert Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-amber-900 dark:text-amber-100">
                  Deadline Reminder
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  You have 3 deadlines approaching this week. Review your calendar to ensure all filings are submitted on time.
                </p>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900 shrink-0"
              >
                View Calendar
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
