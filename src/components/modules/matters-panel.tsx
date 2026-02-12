"use client"

import * as React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Briefcase,
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Calendar,
  User,
  Building2,
  Clock,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  FolderOpen,
  ArrowUpDown,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data for matters
const mockMatters = [
  {
    id: '1',
    matterNumber: 'MAT-2024-001',
    title: 'Smith v. Johnson Corp',
    client: { id: '1', name: 'Smith Holdings LLC' },
    practiceArea: 'litigation',
    status: 'in-progress',
    priority: 'high',
    leadAttorney: 'John Doe',
    openDate: '2024-01-15',
    nextDeadline: '2024-12-20',
    estimatedHours: 120,
    loggedHours: 54,
    budget: 45000,
  },
  {
    id: '2',
    matterNumber: 'MAT-2024-002',
    title: 'Merger Agreement - TechStart Inc',
    client: { id: '2', name: 'TechStart Inc.' },
    practiceArea: 'corporate',
    status: 'in-progress',
    priority: 'urgent',
    leadAttorney: 'Sarah Johnson',
    openDate: '2024-02-01',
    nextDeadline: '2024-12-18',
    estimatedHours: 80,
    loggedHours: 58,
    budget: 32000,
  },
  {
    id: '3',
    matterNumber: 'MAT-2024-003',
    title: 'Estate Planning - Williams Family Trust',
    client: { id: '3', name: 'Williams Family' },
    practiceArea: 'estate-planning',
    status: 'pending',
    priority: 'medium',
    leadAttorney: 'Michael Chen',
    openDate: '2024-03-10',
    nextDeadline: '2024-12-22',
    estimatedHours: 40,
    loggedHours: 34,
    budget: 16000,
  },
  {
    id: '4',
    matterNumber: 'MAT-2024-004',
    title: 'Patent Application - GreenTech Solutions',
    client: { id: '4', name: 'GreenTech Solutions' },
    practiceArea: 'intellectual-property',
    status: 'open',
    priority: 'medium',
    leadAttorney: 'Emily Davis',
    openDate: '2024-04-05',
    nextDeadline: '2025-01-15',
    estimatedHours: 60,
    loggedHours: 12,
    budget: 24000,
  },
  {
    id: '5',
    matterNumber: 'MAT-2024-005',
    title: 'Real Estate Acquisition - Downtown Properties',
    client: { id: '5', name: 'Downtown Properties LLC' },
    practiceArea: 'real-estate',
    status: 'closed',
    priority: 'low',
    leadAttorney: 'John Doe',
    openDate: '2024-01-20',
    nextDeadline: null,
    estimatedHours: 30,
    loggedHours: 28,
    budget: 12000,
  },
]

const practiceAreas = [
  { value: 'all', label: 'All Practice Areas' },
  { value: 'litigation', label: 'Litigation' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'estate-planning', label: 'Estate Planning' },
  { value: 'intellectual-property', label: 'Intellectual Property' },
  { value: 'family-law', label: 'Family Law' },
  { value: 'criminal-defense', label: 'Criminal Defense' },
  { value: 'employment', label: 'Employment' },
  { value: 'immigration', label: 'Immigration' },
  { value: 'tax', label: 'Tax' },
]

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'intake', label: 'Intake' },
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'pending', label: 'Pending' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'closed', label: 'Closed' },
]

const statusColors: Record<string, string> = {
  'intake': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  'open': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  'in-progress': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  'pending': 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  'on-hold': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  'closed': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
}

const priorityColors: Record<string, string> = {
  'low': 'bg-slate-100 text-slate-600',
  'medium': 'bg-amber-100 text-amber-700',
  'high': 'bg-orange-100 text-orange-700',
  'urgent': 'bg-red-100 text-red-700',
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

export function MattersPanel() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPracticeArea, setSelectedPracticeArea] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedMatter, setSelectedMatter] = useState<typeof mockMatters[0] | null>(null)

  const filteredMatters = mockMatters.filter(matter => {
    const matchesSearch = matter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      matter.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      matter.matterNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPractice = selectedPracticeArea === 'all' || matter.practiceArea === selectedPracticeArea
    const matchesStatus = selectedStatus === 'all' || matter.status === selectedStatus
    return matchesSearch && matchesPractice && matchesStatus
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search matters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-slate-200 dark:border-slate-700"
            />
          </div>
          <Select value={selectedPracticeArea} onValueChange={setSelectedPracticeArea}>
            <SelectTrigger className="w-[180px] border-slate-200 dark:border-slate-700">
              <SelectValue placeholder="Practice Area" />
            </SelectTrigger>
            <SelectContent>
              {practiceAreas.map(area => (
                <SelectItem key={area.value} value={area.value}>{area.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[140px] border-slate-200 dark:border-slate-700">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(status => (
                <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="mr-2 h-4 w-4" />
              New Matter
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Matter</DialogTitle>
              <DialogDescription>
                Add a new legal matter to the system
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Matter Title</Label>
                <Input id="title" placeholder="Enter matter title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Smith Holdings LLC</SelectItem>
                    <SelectItem value="2">TechStart Inc.</SelectItem>
                    <SelectItem value="3">Williams Family</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="practice">Practice Area</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select practice area" />
                  </SelectTrigger>
                  <SelectContent>
                    {practiceAreas.filter(p => p.value !== 'all').map(area => (
                      <SelectItem key={area.value} value={area.value}>{area.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
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
                <Label htmlFor="lead">Lead Attorney</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select attorney" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="john">John Doe</SelectItem>
                    <SelectItem value="sarah">Sarah Johnson</SelectItem>
                    <SelectItem value="michael">Michael Chen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Estimated Budget</Label>
                <Input id="budget" type="number" placeholder="0.00" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Enter matter description" rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsCreateOpen(false)}>
                Create Matter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Matters Table */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
      >
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-emerald-600" />
              Legal Matters
              <Badge variant="secondary" className="ml-2">{filteredMatters.length}</Badge>
            </CardTitle>
            <CardDescription>
              Manage and track all legal matters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[120px]">Matter #</TableHead>
                    <TableHead>Title / Client</TableHead>
                    <TableHead>Practice Area</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Lead Attorney</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredMatters.map((matter) => (
                      <motion.tr
                        key={matter.id}
                        variants={item}
                        initial="hidden"
                        animate="show"
                        exit={{ opacity: 0, x: -20 }}
                        className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        onClick={() => setSelectedMatter(matter)}
                      >
                        <TableCell className="font-mono text-sm text-slate-600 dark:text-slate-400">
                          {matter.matterNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">{matter.title}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{matter.client.name}</p>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">
                          {matter.practiceArea.replace('-', ' ')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={statusColors[matter.status]}>
                            {matter.status.replace('-', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={priorityColors[matter.priority]}>
                            {matter.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>{matter.leadAttorney}</TableCell>
                        <TableCell>
                          <div className="w-24">
                            <div className="flex justify-between text-xs mb-1">
                              <span>{matter.loggedHours}h</span>
                              <span>{matter.estimatedHours}h</span>
                            </div>
                            <Progress 
                              value={(matter.loggedHours / matter.estimatedHours) * 100} 
                              className="h-1.5"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(matter.budget)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FolderOpen className="mr-2 h-4 w-4" /> Documents
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>

      {/* Matter Detail Dialog */}
      <Dialog open={!!selectedMatter} onOpenChange={() => setSelectedMatter(null)}>
        <DialogContent className="max-w-3xl">
          {selectedMatter && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-xl">{selectedMatter.title}</DialogTitle>
                    <DialogDescription className="mt-1">
                      {selectedMatter.matterNumber} • {selectedMatter.client.name}
                    </DialogDescription>
                  </div>
                  <Badge variant="secondary" className={statusColors[selectedMatter.status]}>
                    {selectedMatter.status.replace('-', ' ')}
                  </Badge>
                </div>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-500">Client:</span>
                    <span className="font-medium">{selectedMatter.client.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-500">Lead Attorney:</span>
                    <span className="font-medium">{selectedMatter.leadAttorney}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-500">Opened:</span>
                    <span className="font-medium">{new Date(selectedMatter.openDate).toLocaleDateString()}</span>
                  </div>
                  {selectedMatter.nextDeadline && (
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="h-4 w-4 text-amber-500" />
                      <span className="text-slate-500">Next Deadline:</span>
                      <span className="font-medium text-amber-600">{new Date(selectedMatter.nextDeadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <DollarSign className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-500">Budget:</span>
                    <span className="font-medium">{formatCurrency(selectedMatter.budget)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-500">Hours:</span>
                    <span className="font-medium">{selectedMatter.loggedHours}h / {selectedMatter.estimatedHours}h</span>
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-500">Progress</span>
                      <span className="font-medium">{Math.round((selectedMatter.loggedHours / selectedMatter.estimatedHours) * 100)}%</span>
                    </div>
                    <Progress value={(selectedMatter.loggedHours / selectedMatter.estimatedHours) * 100} className="h-2" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedMatter(null)}>Close</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  View Full Details
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
