"use client"

import * as React from "react"
import { useState, useEffect, useTransition } from "react"
import { useSession } from "next-auth/react"
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
  XCircle,
  RefreshCw,
  Video,
  Phone,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { format, parseISO, isSameDay } from "date-fns"

import { getBookings, confirmBooking, cancelBooking } from "@/actions/scheduling"

type Booking = Awaited<ReturnType<typeof getBookings>>[0]

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

const eventTypeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>, color: string, bg: string }> = {
  'meeting': { icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900' },
  'deposition': { icon: MessageSquare, color: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-800' },
  'court-hearing': { icon: Gavel, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900' },
  'deadline': { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900' },
  'consultation': { icon: Users, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900' },
  'booking': { icon: CalendarIcon, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900' },
}

const bookingStatusConfig: Record<string, { color: string, icon: React.ComponentType<{ className?: string }> }> = {
  'ACCEPTED': { color: 'bg-emerald-500', icon: CheckCircle },
  'PENDING': { color: 'bg-amber-500', icon: AlertCircle },
  'CANCELLED': { color: 'bg-slate-400', icon: XCircle },
  'REJECTED': { color: 'bg-red-500', icon: XCircle },
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  type: string
  matter?: string
  location?: string | null
  status: string
  isBooking?: boolean
  booking?: Booking
}

export function CalendarPanel() {
  const { data: session } = useSession()
  const [isPending, startTransition] = useTransition()
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [view, setView] = useState<'month' | 'week'>('month')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)

  const loadBookings = React.useCallback(() => {
    startTransition(async () => {
      try {
        const startDate = new Date(year, month, 1)
        const endDate = new Date(year, month + 1, 0, 23, 59, 59)
        const data = await getBookings({ startDate, endDate })
        setBookings(data)
      } catch (error) {
        console.error("Failed to load bookings:", error)
      }
    })
  }, [year, month])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

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

  const getEventsForDate = (dateStr: string): CalendarEvent[] => {
    const events: CalendarEvent[] = []
    
    bookings.forEach((booking) => {
      const bookingDate = format(booking.startTime, 'yyyy-MM-dd')
      if (bookingDate === dateStr) {
        events.push({
          id: booking.id,
          title: booking.title,
          date: bookingDate,
          time: format(booking.startTime, 'h:mm a'),
          type: 'booking',
          location: booking.location,
          status: booking.status,
          isBooking: true,
          booking,
        })
      }
    })

    const mockEvents: CalendarEvent[] = [
      { id: 'm1', title: 'Deposition - Smith Case', date: '2026-02-28', time: '2:00 PM', type: 'deposition', matter: 'Smith v. Johnson Corp', location: 'Court Reporter Office', status: 'confirmed' },
      { id: 'm2', title: 'Client Meeting - Merger Review', date: '2026-03-01', time: '10:00 AM', type: 'meeting', matter: 'Merger Agreement', location: 'Conference Room A', status: 'confirmed' },
      { id: 'm3', title: 'Court Hearing - Motion to Dismiss', date: '2026-03-05', time: '9:00 AM', type: 'court-hearing', matter: 'Smith v. Johnson Corp', location: 'Federal Court, Room 402', status: 'scheduled' },
    ]

    mockEvents.forEach(event => {
      if (event.date === dateStr) {
        events.push(event)
      }
    })

    return events.sort((a, b) => a.time.localeCompare(b.time))
  }

  const formatDateStr = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const today = new Date()
  const allEvents: CalendarEvent[] = []

  bookings.forEach((booking) => {
    const bookingDate = format(booking.startTime, 'yyyy-MM-dd')
    if (new Date(booking.startTime) >= today) {
      allEvents.push({
        id: booking.id,
        title: booking.title,
        date: bookingDate,
        time: format(booking.startTime, 'h:mm a'),
        type: 'booking',
        location: booking.location,
        status: booking.status,
        isBooking: true,
        booking,
      })
    }
  })

  const upcomingEvents = allEvents
    .filter(event => new Date(event.date) >= today)
    .sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`)
      const dateB = new Date(`${b.date} ${b.time}`)
      return dateA.getTime() - dateB.getTime()
    })
    .slice(0, 8)

  const handleConfirmBooking = (bookingId: string) => {
    startTransition(async () => {
      try {
        await confirmBooking(bookingId)
        toast.success("Booking confirmed")
        loadBookings()
        setSelectedEvent(null)
      } catch (error) {
        toast.error("Failed to confirm booking")
      }
    })
  }

  const handleCancelBooking = (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return
    startTransition(async () => {
      try {
        await cancelBooking(bookingId)
        toast.success("Booking cancelled")
        loadBookings()
        setSelectedEvent(null)
      } catch (error) {
        toast.error("Failed to cancel booking")
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  <Button variant="outline" size="icon" onClick={loadBookings}>
                    <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
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
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                  <div key={`empty-${index}`} className="h-24 rounded-lg" />
                ))}
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
                          const config = eventTypeConfig[event.type] || eventTypeConfig['booking']
                          const statusConfig = bookingStatusConfig[event.status]
                          return (
                            <div
                              key={event.id}
                              className={`text-xs px-1.5 py-0.5 rounded truncate flex items-center gap-1 ${config.bg} ${config.color} cursor-pointer`}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedEvent(event)
                              }}
                            >
                              {event.isBooking && statusConfig && (
                                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.color}`} />
                              )}
                              <span className="truncate">{event.time} {event.title}</span>
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
                  {upcomingEvents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No upcoming events</p>
                    </div>
                  ) : (
                    upcomingEvents.map(event => {
                      const config = eventTypeConfig[event.type] || eventTypeConfig['booking']
                      const Icon = config.icon
                      const statusConfig = bookingStatusConfig[event.status]
                      
                      return (
                        <div
                          key={event.id}
                          className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer transition-colors"
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${config.bg}`}>
                              <Icon className={`h-4 w-4 ${config.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                                  {event.title}
                                </p>
                                {event.isBooking && statusConfig && (
                                  <span className={`w-2 h-2 rounded-full ${statusConfig.color}`} />
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                <Clock className="h-3 w-3" />
                                <span>{event.time}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
                                <CalendarIcon className="h-3 w-3" />
                                <span>{format(parseISO(event.date), 'MMM d, yyyy')}</span>
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
                                  {event.location.toLowerCase().includes('virtual') || event.location.toLowerCase().includes('zoom') ? (
                                    <Video className="h-3 w-3" />
                                  ) : (
                                    <MapPin className="h-3 w-3" />
                                  )}
                                  <span className="truncate">{event.location}</span>
                                </div>
                              )}
                              {event.isBooking && event.booking?.attendees && event.booking.attendees.length > 0 && (
                                <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
                                  <Users className="h-3 w-3" />
                                  <span className="truncate">{event.booking.attendees.map(a => a.name).join(', ')}</span>
                                </div>
                              )}
                              {event.matter && (
                                <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
                                  <Briefcase className="h-3 w-3" />
                                  <span className="truncate">{event.matter}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

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

      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEvent?.title}
              {selectedEvent?.isBooking && selectedEvent.booking && (
                <Badge variant={selectedEvent.booking.status === 'ACCEPTED' ? 'default' : 'secondary'} className={
                  selectedEvent.booking.status === 'ACCEPTED' ? 'bg-emerald-600' :
                  selectedEvent.booking.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : ''
                }>
                  {selectedEvent.booking.status}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{format(parseISO(selectedEvent.date), 'EEEE, MMMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Time</p>
                  <p className="font-medium">{selectedEvent.time}</p>
                </div>
              </div>
              
              {selectedEvent.location && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-medium flex items-center gap-2">
                    {selectedEvent.location.toLowerCase().includes('virtual') || selectedEvent.location.toLowerCase().includes('zoom') ? (
                      <Video className="h-4 w-4" />
                    ) : (
                      <MapPin className="h-4 w-4" />
                    )}
                    {selectedEvent.location}
                  </p>
                </div>
              )}

              {selectedEvent.isBooking && selectedEvent.booking?.attendees && selectedEvent.booking.attendees.length > 0 && (
                <div className="text-sm">
                  <p className="text-muted-foreground mb-2">Attendees</p>
                  <div className="space-y-1">
                    {selectedEvent.booking.attendees.map(attendee => (
                      <div key={attendee.id} className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{attendee.name}</span>
                        <span className="text-muted-foreground text-xs">({attendee.email})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedEvent.booking?.eventType && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Event Type</p>
                  <p className="font-medium">{selectedEvent.booking.eventType.title} ({selectedEvent.booking.eventType.length} min)</p>
                </div>
              )}

              {selectedEvent.isBooking && selectedEvent.booking?.description && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Notes</p>
                  <p className="text-sm bg-muted p-2 rounded">{selectedEvent.booking.description}</p>
                </div>
              )}

              {selectedEvent.isBooking && selectedEvent.booking && (
                <div className="flex gap-2 pt-2">
                  {selectedEvent.booking.status === 'PENDING' && (
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleConfirmBooking(selectedEvent.booking!.id)}
                      disabled={isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm
                    </Button>
                  )}
                  {selectedEvent.booking.status !== 'CANCELLED' && (
                    <Button
                      variant="outline"
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleCancelBooking(selectedEvent.booking!.id)}
                      disabled={isPending}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}