"use client"

import * as React from "react"
import { useState, useTransition, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  Clock,
  Users,
  Calendar,
  Plus,
  Edit,
  Trash2,
  GripVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Timer,
  DollarSign,
  Globe,
  Briefcase,
  RefreshCw,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

import {
  getEventTypes,
  createEventType,
  updateEventType,
  deleteEventType,
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  updateAvailability,
  getBookings,
  cancelBooking,
  confirmBooking,
  getSchedulingStats,
} from "@/actions/scheduling"

type EventType = Awaited<ReturnType<typeof getEventTypes>>[0]
type Schedule = Awaited<ReturnType<typeof getSchedules>>[0]
type Booking = Awaited<ReturnType<typeof getBookings>>[0]

type UpdateEventTypeData = {
  title?: string
  slug?: string
  description?: string
  length?: number
  price?: number
  currency?: string
  hidden?: boolean
  schedulingType?: string
  slotDuration?: number
  minimumBookingNotice?: number
  beforeEventBuffer?: number
  afterEventBuffer?: number
  requiresConfirmation?: boolean
  scheduleId?: string
  position?: number
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`)

export function SchedulingPanel() {
  const { data: session } = useSession()
  const [isPending, startTransition] = useTransition()

  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState<{
    eventTypesCount: number
    upcomingBookings: number
    pendingBookings: number
    totalBookings: number
  } | null>(null)

  const [activeTab, setActiveTab] = useState("event-types")
  const [isCreateEventTypeOpen, setIsCreateEventTypeOpen] = useState(false)
  const [isCreateScheduleOpen, setIsCreateScheduleOpen] = useState(false)
  const [editingEventType, setEditingEventType] = useState<EventType | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    startTransition(async () => {
      try {
        const [et, sc, bk, st] = await Promise.all([
          getEventTypes(),
          getSchedules(),
          getBookings({ startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }),
          getSchedulingStats(),
        ])
        setEventTypes(et)
        setSchedules(sc)
        setBookings(bk)
        setStats(st)
      } catch (error) {
        toast.error("Failed to load scheduling data")
      }
    })
  }

  const handleCreateEventType = async (formData: FormData) => {
    startTransition(async () => {
      try {
        const title = formData.get("title") as string
        const slug = formData.get("slug") as string || title.toLowerCase().replace(/\s+/g, "-")
        const length = parseInt(formData.get("length") as string) || 30
        const price = parseFloat(formData.get("price") as string) || 0
        const description = formData.get("description") as string

        await createEventType({
          title,
          slug,
          length,
          price,
          description,
          hidden: false,
        })
        toast.success("Event type created")
        setIsCreateEventTypeOpen(false)
        loadData()
      } catch (error) {
        toast.error("Failed to create event type")
      }
    })
  }

  const handleUpdateEventType = async (id: string, data: UpdateEventTypeData) => {
    startTransition(async () => {
      try {
        await updateEventType(id, data)
        toast.success("Event type updated")
        setEditingEventType(null)
        loadData()
      } catch (error) {
        toast.error("Failed to update event type")
      }
    })
  }

  const handleDeleteEventType = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event type?")) return
    startTransition(async () => {
      try {
        await deleteEventType(id)
        toast.success("Event type deleted")
        loadData()
      } catch (error) {
        toast.error("Failed to delete event type")
      }
    })
  }

  const handleCancelBooking = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return
    startTransition(async () => {
      try {
        await cancelBooking(id)
        toast.success("Booking cancelled")
        loadData()
      } catch (error) {
        toast.error("Failed to cancel booking")
      }
    })
  }

  const handleConfirmBooking = async (id: string) => {
    startTransition(async () => {
      try {
        await confirmBooking(id)
        toast.success("Booking confirmed")
        loadData()
      } catch (error) {
        toast.error("Failed to confirm booking")
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Event Types</p>
                <p className="text-2xl font-bold">{stats?.eventTypesCount || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900">
                <Calendar className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold">{stats?.upcomingBookings || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats?.pendingBookings || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{stats?.totalBookings || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="event-types">Event Types</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="event-types" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Event Types</h3>
              <p className="text-sm text-muted-foreground">Manage your consultation types and meeting durations</p>
            </div>
            <Dialog open={isCreateEventTypeOpen} onOpenChange={setIsCreateEventTypeOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="mr-2 h-4 w-4" />
                  New Event Type
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Event Type</DialogTitle>
                  <DialogDescription>Add a new consultation or meeting type</DialogDescription>
                </DialogHeader>
                <form action={handleCreateEventType} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" placeholder="e.g., Initial Consultation" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input id="slug" name="slug" placeholder="e.g., initial-consultation" />
                    <p className="text-xs text-muted-foreground">Auto-generated from title if left empty</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="length">Duration (minutes)</Label>
                      <Select name="length" defaultValue="30">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 min</SelectItem>
                          <SelectItem value="30">30 min</SelectItem>
                          <SelectItem value="45">45 min</SelectItem>
                          <SelectItem value="60">60 min</SelectItem>
                          <SelectItem value="90">90 min</SelectItem>
                          <SelectItem value="120">120 min</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price</Label>
                      <Input id="price" name="price" type="number" step="0.01" placeholder="0.00" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" placeholder="Describe this event type..." rows={3} />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateEventTypeOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isPending}>
                      Create
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <ScrollArea className="h-[500px]">
            <AnimatePresence mode="popLayout">
              {eventTypes.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No event types yet</p>
                    <p className="text-sm text-muted-foreground">Create your first event type to get started</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {eventTypes.map((et, index) => (
                    <motion.div
                      key={et.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <GripVertical className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium truncate">{et.title}</h4>
                                {et.hidden && (
                                  <Badge variant="secondary" className="text-xs">Hidden</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                /{et.slug} · {et.length} min
                                {et.price > 0 && ` · $${et.price}`}
                              </p>
                              {et.description && (
                                <p className="text-xs text-muted-foreground mt-1 truncate">{et.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingEventType(et)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteEventType(et.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="availability" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Availability</h3>
              <p className="text-sm text-muted-foreground">Set your weekly availability for bookings</p>
            </div>
            <Dialog open={isCreateScheduleOpen} onOpenChange={setIsCreateScheduleOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="mr-2 h-4 w-4" />
                  New Schedule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Schedule</DialogTitle>
                  <DialogDescription>Define your weekly availability</DialogDescription>
                </DialogHeader>
                <ScheduleForm
                  onSubmit={async (data) => {
                    startTransition(async () => {
                      try {
                        await createSchedule(data)
                        toast.success("Schedule created")
                        setIsCreateScheduleOpen(false)
                        loadData()
                      } catch (error) {
                        toast.error("Failed to create schedule")
                      }
                    })
                  }}
                  onCancel={() => setIsCreateScheduleOpen(false)}
                  isPending={isPending}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {schedules.length === 0 ? (
              <Card className="border-dashed lg:col-span-2">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Timer className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No schedules yet</p>
                  <p className="text-sm text-muted-foreground">Create your first schedule to define availability</p>
                </CardContent>
              </Card>
            ) : (
              schedules.map((schedule) => (
                <Card key={schedule.id} className="border-slate-200 dark:border-slate-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{schedule.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {schedule.timeZone}
                        </CardDescription>
                      </div>
                      {schedule.isDefault && (
                        <Badge variant="default" className="bg-emerald-600">Default</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {schedule.availability.map((avail) => {
                        const days = JSON.parse(avail.days) as number[]
                        return (
                          <div key={avail.id} className="flex items-center gap-2 text-sm">
                            <div className="flex gap-1">
                              {DAY_NAMES.map((day, i) => (
                                <div
                                  key={day}
                                  className={`w-6 h-6 rounded text-xs flex items-center justify-center ${
                                    days.includes(i)
                                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                                      : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                                  }`}
                                >
                                  {day[0]}
                                </div>
                              ))}
                            </div>
                            <span className="text-muted-foreground">
                              {avail.startTime} - {avail.endTime}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          if (confirm("Delete this schedule?")) {
                            startTransition(async () => {
                              try {
                                await deleteSchedule(schedule.id)
                                toast.success("Schedule deleted")
                                loadData()
                              } catch (error) {
                                toast.error("Failed to delete schedule")
                              }
                            })
                          }
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Bookings</h3>
              <p className="text-sm text-muted-foreground">Manage your upcoming appointments</p>
            </div>
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          <ScrollArea className="h-[500px]">
            {bookings.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No upcoming bookings</p>
                  <p className="text-sm text-muted-foreground">Bookings will appear here when clients schedule</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="border-slate-200 dark:border-slate-800">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${
                          booking.status === "ACCEPTED" ? "bg-emerald-100 dark:bg-emerald-900" :
                          booking.status === "PENDING" ? "bg-amber-100 dark:bg-amber-900" :
                          "bg-slate-100 dark:bg-slate-800"
                        }`}>
                          <Calendar className={`h-5 w-5 ${
                            booking.status === "ACCEPTED" ? "text-emerald-600" :
                            booking.status === "PENDING" ? "text-amber-600" :
                            "text-slate-400"
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium truncate">{booking.title}</h4>
                            <Badge variant={
                              booking.status === "ACCEPTED" ? "default" :
                              booking.status === "PENDING" ? "secondary" :
                              "outline"
                            } className={
                              booking.status === "ACCEPTED" ? "bg-emerald-600" :
                              booking.status === "PENDING" ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" :
                              ""
                            }>
                              {booking.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(booking.startTime).toLocaleDateString()} at{" "}
                              {new Date(booking.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                            {booking.location && (
                              <div className="flex items-center gap-1">
                                <Briefcase className="h-3 w-3" />
                                {booking.location}
                              </div>
                            )}
                          </div>
                          {booking.attendees.length > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              {booking.attendees.map((a) => (
                                <Badge key={a.id} variant="outline" className="text-xs">
                                  {a.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          {booking.status === "PENDING" && (
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => handleConfirmBooking(booking.id)}
                              disabled={isPending}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Confirm
                            </Button>
                          )}
                          {booking.status !== "CANCELLED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleCancelBooking(booking.id)}
                              disabled={isPending}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <Dialog open={!!editingEventType} onOpenChange={() => setEditingEventType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event Type</DialogTitle>
            <DialogDescription>Update event type settings</DialogDescription>
          </DialogHeader>
          {editingEventType && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editingEventType.title}
                  onChange={(e) => setEditingEventType({ ...editingEventType, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration (min)</Label>
                  <Select
                    value={editingEventType.length.toString()}
                    onValueChange={(v) => setEditingEventType({ ...editingEventType, length: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="30">30</SelectItem>
                      <SelectItem value="45">45</SelectItem>
                      <SelectItem value="60">60</SelectItem>
                      <SelectItem value="90">90</SelectItem>
                      <SelectItem value="120">120</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingEventType.price}
                    onChange={(e) => setEditingEventType({ ...editingEventType, price: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingEventType.description || ""}
                  onChange={(e) => setEditingEventType({ ...editingEventType, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Hidden</Label>
                <Switch
                  checked={editingEventType.hidden}
                  onCheckedChange={(checked) => setEditingEventType({ ...editingEventType, hidden: checked })}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingEventType(null)}>Cancel</Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => handleUpdateEventType(editingEventType.id, {
                    title: editingEventType.title,
                    length: editingEventType.length,
                    price: editingEventType.price,
                    description: editingEventType.description || undefined,
                    hidden: editingEventType.hidden,
                  })}
                  disabled={isPending}
                >
                  Save
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ScheduleForm({
  onSubmit,
  onCancel,
  isPending,
}: {
  onSubmit: (data: { name: string; timeZone: string; isDefault: boolean; availability: Array<{ days: number[]; startTime: string; endTime: string }> }) => void
  onCancel: () => void
  isPending: boolean
}) {
  const [name, setName] = useState("")
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [isDefault, setIsDefault] = useState(false)
  const [availability, setAvailability] = useState<Array<{ days: number[]; startTime: string; endTime: string }>>([
    { days: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "17:00" },
  ])

  const addAvailability = () => {
    setAvailability([...availability, { days: [], startTime: "09:00", endTime: "17:00" }])
  }

  const removeAvailability = (index: number) => {
    setAvailability(availability.filter((_, i) => i !== index))
  }

  const toggleDay = (index: number, day: number) => {
    const newAvail = [...availability]
    const currentDays = newAvail[index].days
    if (currentDays.includes(day)) {
      newAvail[index].days = currentDays.filter((d) => d !== day)
    } else {
      newAvail[index].days = [...currentDays, day].sort()
    }
    setAvailability(newAvail)
  }

  const handleSubmit = () => {
    onSubmit({ name, timeZone, isDefault, availability: availability.filter((a) => a.days.length > 0) })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Schedule Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Work Hours"
        />
      </div>
      <div className="space-y-2">
        <Label>Time Zone</Label>
        <Input value={timeZone} onChange={(e) => setTimeZone(e.target.value)} />
      </div>
      <div className="flex items-center justify-between">
        <Label>Set as Default</Label>
        <Switch checked={isDefault} onCheckedChange={setIsDefault} />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Weekly Availability</Label>
          <Button type="button" variant="outline" size="sm" onClick={addAvailability}>
            <Plus className="h-3 w-3 mr-1" />
            Add Time
          </Button>
        </div>
        {availability.map((avail, index) => (
          <div key={index} className="p-3 border rounded-lg space-y-3">
            <div className="flex gap-1">
              {DAY_NAMES.map((day, i) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(index, i)}
                  className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                    avail.days.includes(i)
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {day[0]}
                </button>
              ))}
              {availability.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-auto"
                  onClick={() => removeAvailability(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Start</Label>
                <Select
                  value={avail.startTime}
                  onValueChange={(v) => {
                    const newAvail = [...availability]
                    newAvail[index].startTime = v
                    setAvailability(newAvail)
                  }}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">End</Label>
                <Select
                  value={avail.endTime}
                  onValueChange={(v) => {
                    const newAvail = [...availability]
                    newAvail[index].endTime = v
                    setAvailability(newAvail)
                  }}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="button" className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSubmit} disabled={isPending}>
          Create Schedule
        </Button>
      </DialogFooter>
    </div>
  )
}