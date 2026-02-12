"use client"

import * as React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  Briefcase,
  Gavel,
  MessageSquare,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { motion } from "framer-motion"

// Calendar helper functions
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate()
}

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay()
}

const isToday = (date: Date) => {
  const today = new Date()
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

// Mock events
const mockEvents = [
  { id: '1', title: 'Deposition - Smith Case', date: '2024-11-28', time: '2:00 PM', type: 'deposition', matter: 'Smith v. Johnson Corp', location: 'Court Reporter Office', status: 'confirmed' },
  { id: '2', title: 'Client Meeting - Merger Review', date: '2024-11-29', time: '10:00 AM', type: 'meeting', matter: 'Merger Agreement', location: 'Conference Room A', status: 'confirmed' },
  { id: '3', title: 'Court Hearing - Motion to Dismiss', date: '2024-12-03', time: '9:00 AM', type: 'court-hearing', matter: 'Smith v. Johnson Corp', location: 'Federal Court, Room 402', status: 'scheduled' },
  { id: '4', title: 'Document Filing Deadline', date: '2024-12-05', time: '5:00 PM', type: 'deadline', matter: 'Williams Trust', location: null, status: 'pending' },
  { id: '5', title: 'Settlement Conference', date: '2024-12-10', time: '2:30 PM', type: 'court-hearing', matter: 'Smith v. Johnson Corp', location: 'Mediation Center', status: 'scheduled' },
  { id: '6', title: 'Patent Review Meeting', date: '2024-11-28', time: '4:00 PM', type: 'meeting', matter: 'Patent Application', location: 'Virtual', status: 'confirmed' },
]

const eventTypeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>, color: string, bg: string }> = {
  'meeting': { icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900' },
  'deposition': { icon: MessageSquare, color: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-800' },
  'court-hearing': { icon: Gavel, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900' },
  'deadline': { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900' },
  'consultation': { icon: Users, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900' },
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function CalendarPanel() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [view, setView] = useState<'month' | 'week'>('month')
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const getEventsForDate = (dateStr: string) => {
    return mockEvents.filter(event => event.date === dateStr)
  }

  const formatDateStr = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  // Get upcoming events
  const today = new Date()
  const upcomingEvents = mockEvents
    .filter(event => new Date(event.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={goToNextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-xl">
                    {monthNames[month]} {year}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={goToToday}>
                    Today
                  </Button>
                  <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="mr-2 h-4 w-4" />
                        New Event
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Schedule Event</DialogTitle>
                        <DialogDescription>
                          Create a new calendar event
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Event Title</Label>
                          <Input placeholder="Enter event title" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Event Type</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="meeting">Meeting</SelectItem>
                                <SelectItem value="court-hearing">Court Hearing</SelectItem>
                                <SelectItem value="deposition">Deposition</SelectItem>
                                <SelectItem value="deadline">Deadline</SelectItem>
                                <SelectItem value="consultation">Consultation</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Matter</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select matter" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">Smith v. Johnson Corp</SelectItem>
                                <SelectItem value="2">Merger Agreement</SelectItem>
                                <SelectItem value="3">Estate Planning</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Date</Label>
                            <Input type="date" />
                          </div>
                          <div className="space-y-2">
                            <Label>Time</Label>
                            <Input type="time" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Location</Label>
                          <Input placeholder="Enter location or 'Virtual'" />
                        </div>
                        <div className="space-y-2">
                          <Label>Notes</Label>
                          <Textarea placeholder="Additional notes" rows={3} />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsCreateOpen(false)}>
                          Schedule Event
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 py-2">
                    {day}
                  </div>
                ))}
              </div>
              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before the first day of the month */}
                {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                  <div key={`empty-${index}`} className="h-24 rounded-lg" />
                ))}
                {/* Days of the month */}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1
                  const dateStr = formatDateStr(day)
                  const events = getEventsForDate(dateStr)
                  const date = new Date(year, month, day)
                  const isSelected = selectedDate?.toDateString() === date.toDateString()
                  const isTodayDate = isToday(date)

                  return (
                    <motion.div
                      key={day}
                      whileHover={{ scale: 1.02 }}
                      className={`h-24 p-1 rounded-lg border cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      } ${isTodayDate ? 'ring-2 ring-emerald-500 ring-offset-1' : ''}`}
                      onClick={() => setSelectedDate(date)}
                    >
                      <div className={`text-sm font-medium mb-1 ${isTodayDate ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'}`}>
                        {day}
                      </div>
                      <div className="space-y-1 overflow-hidden">
                        {events.slice(0, 2).map(event => {
                          const config = eventTypeConfig[event.type]
                          return (
                            <div
                              key={event.id}
                              className={`text-xs px-1.5 py-0.5 rounded truncate ${config.bg} ${config.color}`}
                            >
                              {event.time} {event.title}
                            </div>
                          )
                        })}
                        {events.length > 2 && (
                          <div className="text-xs text-slate-500 px-1.5">
                            +{events.length - 2} more
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Upcoming Events */}
        <div className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-emerald-600" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {upcomingEvents.map(event => {
                    const config = eventTypeConfig[event.type]
                    const Icon = config.icon
                    return (
                      <div
                        key={event.id}
                        className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${config.bg}`}>
                            <Icon className={`h-4 w-4 ${config.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                              {event.title}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                              <Clock className="h-3 w-3" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
                              <CalendarIcon className="h-3 w-3" />
                              <span>{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
                              <Briefcase className="h-3 w-3" />
                              <span className="truncate">{event.matter}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Event Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(eventTypeConfig).map(([type, config]) => {
                  const Icon = config.icon
                  return (
                    <div key={type} className="flex items-center gap-2">
                      <div className={`p-1 rounded ${config.bg}`}>
                        <Icon className={`h-3 w-3 ${config.color}`} />
                      </div>
                      <span className="text-xs capitalize">{type.replace('-', ' ')}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
