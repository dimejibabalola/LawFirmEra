"use client"

import * as React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckSquare,
  Plus,
  Search,
  Calendar,
  User,
  MoreHorizontal,
  GripVertical,
  Clock,
  Briefcase,
  LayoutGrid,
  List,
  CheckCircle2,
  Circle,
  Timer,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock tasks
const mockTasks = [
  { id: '1', title: 'Review discovery documents', description: 'Review all discovery documents from opposing counsel', status: 'in-progress', priority: 'high', dueDate: '2024-11-28', matter: 'Smith v. Johnson Corp', assignee: 'John Doe', createdAt: '2024-11-20' },
  { id: '2', title: 'Draft merger agreement amendments', description: 'Prepare amendments based on client feedback', status: 'in-progress', priority: 'urgent', dueDate: '2024-11-29', matter: 'Merger Agreement', assignee: 'Sarah Johnson', createdAt: '2024-11-21' },
  { id: '3', title: 'Prepare trust documents', description: 'Finalize trust documentation for client signature', status: 'pending', priority: 'medium', dueDate: '2024-12-05', matter: 'Williams Trust', assignee: 'Michael Chen', createdAt: '2024-11-22' },
  { id: '4', title: 'Research patent prior art', description: 'Conduct prior art search for patent application', status: 'pending', priority: 'medium', dueDate: '2024-12-10', matter: 'Patent Application', assignee: 'Emily Davis', createdAt: '2024-11-23' },
  { id: '5', title: 'Client consultation notes', description: 'Document consultation notes from yesterday meeting', status: 'completed', priority: 'low', dueDate: '2024-11-27', matter: 'Smith v. Johnson Corp', assignee: 'John Doe', completedAt: '2024-11-27', createdAt: '2024-11-26' },
  { id: '6', title: 'File court motion', description: 'File motion for extension of time', status: 'pending', priority: 'high', dueDate: '2024-12-01', matter: 'Smith v. Johnson Corp', assignee: 'John Doe', createdAt: '2024-11-24' },
  { id: '7', title: 'Update case timeline', description: 'Update case timeline with new deadlines', status: 'completed', priority: 'low', dueDate: '2024-11-26', matter: 'Merger Agreement', assignee: 'Sarah Johnson', completedAt: '2024-11-25', createdAt: '2024-11-23' },
  { id: '8', title: 'Review settlement offer', description: 'Analyze settlement offer from opposing counsel', status: 'in-progress', priority: 'urgent', dueDate: '2024-11-30', matter: 'Smith v. Johnson Corp', assignee: 'John Doe', createdAt: '2024-11-25' },
]

const priorityColors: Record<string, string> = {
  'low': 'bg-slate-100 text-slate-600 border-slate-200',
  'medium': 'bg-amber-100 text-amber-700 border-amber-200',
  'high': 'bg-orange-100 text-orange-700 border-orange-200',
  'urgent': 'bg-red-100 text-red-700 border-red-200',
}

const statusColumns = [
  { id: 'pending', title: 'Pending', icon: Circle, color: 'text-slate-500' },
  { id: 'in-progress', title: 'In Progress', icon: Timer, color: 'text-amber-500' },
  { id: 'completed', title: 'Completed', icon: CheckCircle2, color: 'text-emerald-500' },
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

export function TasksPanel() {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [tasks, setTasks] = useState(mockTasks)

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.matter.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter(task => task.status === status)
  }

  const handleStatusChange = (taskId: string, newStatus: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus, completedAt: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null }
        : task
    ))
  }

  const taskCounts = {
    pending: getTasksByStatus('pending').length,
    'in-progress': getTasksByStatus('in-progress').length,
    completed: getTasksByStatus('completed').length,
  }

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'completed') return false
    return new Date(dueDate) < new Date()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-slate-200 dark:border-slate-700"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[160px] border-slate-200 dark:border-slate-700">
              <SelectValue placeholder="Filter by assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              <SelectItem value="john">John Doe</SelectItem>
              <SelectItem value="sarah">Sarah Johnson</SelectItem>
              <SelectItem value="michael">Michael Chen</SelectItem>
              <SelectItem value="emily">Emily Davis</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-md">
            <Button
              variant={viewMode === 'board' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-9 w-9 rounded-r-none"
              onClick={() => setViewMode('board')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-9 w-9 rounded-l-none"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Task</DialogTitle>
              <DialogDescription>
                Add a new task to the system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Task Title</Label>
                <Input placeholder="Enter task title" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Task description" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Matter</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select matter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Smith v. Johnson Corp</SelectItem>
                      <SelectItem value="2">Merger Agreement</SelectItem>
                      <SelectItem value="3">Williams Trust</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assignee</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="john">John Doe</SelectItem>
                      <SelectItem value="sarah">Sarah Johnson</SelectItem>
                      <SelectItem value="michael">Michael Chen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="date" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsCreateOpen(false)}>
                Create Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {statusColumns.map(column => (
          <Card key={column.id} className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-4 flex items-center gap-3">
              <column.icon className={`h-5 w-5 ${column.color}`} />
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{taskCounts[column.id as keyof typeof taskCounts]}</p>
                <p className="text-sm text-slate-500">{column.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Board View */}
      {viewMode === 'board' && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {statusColumns.map(column => (
            <div key={column.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <column.icon className={`h-5 w-5 ${column.color}`} />
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">{column.title}</h3>
                  <Badge variant="secondary" className="text-xs">{taskCounts[column.id as keyof typeof taskCounts]}</Badge>
                </div>
              </div>
              <ScrollArea className="h-[500px] pr-2">
                <div className="space-y-3">
                  <AnimatePresence>
                    {getTasksByStatus(column.id).map(task => (
                      <motion.div
                        key={task.id}
                        variants={item}
                        initial="hidden"
                        animate="show"
                        exit={{ opacity: 0, scale: 0.95 }}
                        layout
                      >
                        <Card className={`border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow cursor-pointer ${isOverdue(task.dueDate, task.status) ? 'border-red-200 dark:border-red-800' : ''}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-slate-900 dark:text-slate-100 line-clamp-2">
                                {task.title}
                              </h4>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleStatusChange(task.id, column.id === 'pending' ? 'in-progress' : column.id === 'in-progress' ? 'completed' : 'pending')}>
                                    Move to {column.id === 'pending' ? 'In Progress' : column.id === 'in-progress' ? 'Completed' : 'Pending'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>Edit</DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <p className="text-sm text-slate-500 line-clamp-2 mb-3">{task.description}</p>
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="outline" className={`text-xs ${priorityColors[task.priority]}`}>
                                {task.priority}
                              </Badge>
                              {isOverdue(task.dueDate, task.status) && (
                                <Badge variant="outline" className="text-xs bg-red-100 text-red-700 border-red-200">
                                  Overdue
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <div className="flex items-center gap-1">
                                <Briefcase className="h-3 w-3" />
                                <span className="truncate max-w-[120px]">{task.matter}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200">
                                  {task.assignee.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-slate-500">{task.assignee}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </div>
          ))}
        </motion.div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTasks.map(task => (
                  <div
                    key={task.id}
                    className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer ${isOverdue(task.dueDate, task.status) ? 'bg-red-50 dark:bg-red-950/20' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        task.status === 'completed' ? 'bg-emerald-500' :
                        task.status === 'in-progress' ? 'bg-amber-500' : 'bg-slate-300'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-medium ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-slate-100'}`}>
                            {task.title}
                          </p>
                          <Badge variant="outline" className={`text-xs ${priorityColors[task.priority]}`}>
                            {task.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {task.matter}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {task.assignee}
                          </span>
                        </div>
                      </div>
                      <Badge variant="secondary" className={task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : task.status === 'in-progress' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}>
                        {task.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
