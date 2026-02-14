/**
 * Cal.com Core - Source Level Integration
 * 
 * This package provides Cal.com functionality directly embedded in LegalFlow
 * WITHOUT using iframes or HTTP APIs.
 * 
 * Based on Cal.com open source components
 */

import React from 'react'
import { Calendar, Clock, Users, Video, MapPin, Check, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addDays, startOfWeek, endOfWeek, isSameDay, isToday, setHours, setMinutes, isAfter, isBefore, parseISO, addMinutes } from 'date-fns'
import { cn } from './utils'

// ============================================
// Types
// ============================================

export interface EventType {
  id: number
  title: string
  slug: string
  description?: string
  length: number
  price: number
  currency: string
  hidden?: boolean
}

export interface TimeSlot {
  time: Date
  available: boolean
  attendees?: number
}

export interface BookingFormData {
  name: string
  email: string
  phone?: string
  notes?: string
  location?: string
}

export interface BookingResult {
  success: boolean
  bookingId?: string
  error?: string
}

// ============================================
// Booking Flow Component
// ============================================

interface BookingFlowProps {
  eventType: EventType
  availableSlots?: TimeSlot[]
  onBooking: (data: { slot: TimeSlot; formData: BookingFormData }) => Promise<BookingResult>
  className?: string
}

export function BookingFlow({ eventType, availableSlots = [], onBooking, className }: BookingFlowProps) {
  const [step, setStep] = React.useState<'select' | 'form' | 'confirm'>('select')
  const [selectedSlot, setSelectedSlot] = React.useState<TimeSlot | null>(null)
  const [formData, setFormData] = React.useState<BookingFormData>({
    name: '', email: '', phone: '', notes: ''
  })
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [result, setResult] = React.useState<BookingResult | null>(null)

  const handleSelectSlot = (slot: TimeSlot) => {
    if (slot.available) {
      setSelectedSlot(slot)
      setStep('form')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSlot) return

    setIsSubmitting(true)
    try {
      const res = await onBooking({ slot: selectedSlot, formData })
      setResult(res)
      if (res.success) {
        setStep('confirm')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm", className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900">{eventType.title}</h2>
        {eventType.description && (
          <p className="text-gray-500 mt-1">{eventType.description}</p>
        )}
        <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{eventType.length} min</span>
          </div>
          {eventType.price > 0 && (
            <div className="flex items-center gap-1">
              <span className="font-medium">
                {eventType.currency} {eventType.price}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {step === 'select' && (
          <SlotPicker
            slots={availableSlots}
            eventLength={eventType.length}
            onSelect={handleSelectSlot}
          />
        )}

        {step === 'form' && selectedSlot && (
          <BookingForm
            slot={selectedSlot}
            eventLength={eventType.length}
            formData={formData}
            onChange={setFormData}
            onSubmit={handleSubmit}
            onBack={() => setStep('select')}
            isSubmitting={isSubmitting}
            error={result?.error}
          />
        )}

        {step === 'confirm' && result?.success && (
          <BookingConfirmation
            slot={selectedSlot!}
            eventLength={eventType.length}
            formData={formData}
            eventType={eventType}
          />
        )}
      </div>
    </div>
  )
}

// ============================================
// Slot Picker Component
// ============================================

interface SlotPickerProps {
  slots: TimeSlot[]
  eventLength: number
  onSelect: (slot: TimeSlot) => void
}

function SlotPicker({ slots, eventLength, onSelect }: SlotPickerProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const slotsByDay = React.useMemo(() => {
    const grouped: Record<string, TimeSlot[]> = {}
    slots.forEach(slot => {
      const key = format(slot.time, 'yyyy-MM-dd')
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(slot)
    })
    return grouped
  }, [slots])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentDate(addDays(weekStart, -7))}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-medium">
          {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
        </h3>
        <button
          onClick={() => setCurrentDate(addDays(weekStart, 7))}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day columns */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const daySlots = slotsByDay[format(day, 'yyyy-MM-dd')] || []
          const hasAvailable = daySlots.some(s => s.available)

          return (
            <div key={day.toISOString()} className="text-center">
              <div className={cn(
                "py-2 text-sm font-medium",
                isToday(day) && "text-teal-600"
              )}>
                <div>{format(day, 'EEE')}</div>
                <div className={cn(
                  "w-8 h-8 mx-auto rounded-full flex items-center justify-center",
                  isToday(day) && "bg-teal-600 text-white"
                )}>
                  {format(day, 'd')}
                </div>
              </div>

              <div className="mt-2 space-y-1">
                {daySlots.slice(0, 4).map((slot, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelect(slot)}
                    disabled={!slot.available}
                    className={cn(
                      "w-full py-1.5 px-2 text-xs rounded-md transition-colors",
                      slot.available
                        ? "bg-teal-50 text-teal-700 hover:bg-teal-100 cursor-pointer"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    {format(slot.time, 'h:mm a')}
                  </button>
                ))}
                {daySlots.length > 4 && (
                  <div className="text-xs text-gray-500">
                    +{daySlots.length - 4} more
                  </div>
                )}
                {!hasAvailable && daySlots.length === 0 && (
                  <div className="text-xs text-gray-400 py-4">No slots</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// Booking Form Component
// ============================================

interface BookingFormProps {
  slot: TimeSlot
  eventLength: number
  formData: BookingFormData
  onChange: (data: BookingFormData) => void
  onSubmit: (e: React.FormEvent) => void
  onBack: () => void
  isSubmitting: boolean
  error?: string
}

function BookingForm({ slot, eventLength, formData, onChange, onSubmit, onBack, isSubmitting, error }: BookingFormProps) {
  const endTime = addMinutes(slot.time, eventLength)

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to time slots
      </button>

      <div className="bg-teal-50 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-teal-700">
          <Calendar className="w-5 h-5" />
          <span className="font-medium">{format(slot.time, 'EEEE, MMMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-2 text-teal-600 mt-1">
          <Clock className="w-4 h-4" />
          <span>{format(slot.time, 'h:mm a')} - {format(endTime, 'h:mm a')}</span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => onChange({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => onChange({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => onChange({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => onChange({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
        </button>
      </form>
    </div>
  )
}

// ============================================
// Booking Confirmation Component
// ============================================

interface BookingConfirmationProps {
  slot: TimeSlot
  eventLength: number
  formData: BookingFormData
  eventType: EventType
}

function BookingConfirmation({ slot, eventLength, formData, eventType }: BookingConfirmationProps) {
  const endTime = addMinutes(slot.time, eventLength)

  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
        <Check className="w-8 h-8 text-green-600" />
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">Booking Confirmed!</h3>
      <p className="text-gray-500 mb-6">
        We've sent a confirmation email to {formData.email}
      </p>

      <div className="bg-gray-50 rounded-lg p-4 text-left max-w-sm mx-auto">
        <div className="flex items-center gap-2 text-gray-700 mb-2">
          <Calendar className="w-4 h-4" />
          <span>{format(slot.time, 'EEEE, MMMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700 mb-2">
          <Clock className="w-4 h-4" />
          <span>{format(slot.time, 'h:mm a')} - {format(endTime, 'h:mm a')}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Users className="w-4 h-4" />
          <span>{eventType.title}</span>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Calendar View Component
// ============================================

interface CalendarViewProps {
  bookings: Array<{
    id: string
    title: string
    startTime: Date
    endTime: Date
    status: string
    attendees?: Array<{ name: string; email: string }>
  }>
  onBookingClick?: (bookingId: string) => void
  className?: string
}

export function CalendarView({ bookings, onBookingClick, className }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [view, setView] = React.useState<'week' | 'month'>('week')

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const hours = Array.from({ length: 12 }, (_, i) => i + 8) // 8am to 7pm

  const getBookingsForSlot = (day: Date, hour: number) => {
    return bookings.filter(b => {
      const startHour = b.startTime.getHours()
      return isSameDay(b.startTime, day) && startHour === hour
    })
  }

  return (
    <div className={cn("bg-white rounded-xl border border-gray-200", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentDate(addDays(currentDate, -7))}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold">
            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </h2>
          <button
            onClick={() => setCurrentDate(addDays(currentDate, 7))}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('week')}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg",
              view === 'week' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600'
            )}
          >
            Week
          </button>
          <button
            onClick={() => setView('month')}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg",
              view === 'month' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600'
            )}
          >
            Month
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-auto">
        <div className="min-w-[800px]">
          {/* Day headers */}
          <div className="grid grid-cols-8 border-b border-gray-100">
            <div className="p-2 text-xs text-gray-400"></div>
            {days.map((day) => (
              <div
                key={day.toISOString()}
                className={cn(
                  "p-2 text-center border-l border-gray-100",
                  isToday(day) && "bg-teal-50"
                )}
              >
                <div className="text-xs text-gray-500">{format(day, 'EEE')}</div>
                <div className={cn(
                  "text-sm font-medium",
                  isToday(day) && "text-teal-600"
                )}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>

          {/* Time rows */}
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-gray-50">
              <div className="p-2 text-xs text-gray-400 text-right pr-3">
                {format(setHours(new Date(), hour), 'h a')}
              </div>
              {days.map((day) => {
                const slotBookings = getBookingsForSlot(day, hour)
                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "min-h-[60px] border-l border-gray-100 p-1",
                      isToday(day) && "bg-teal-50/50"
                    )}
                  >
                    {slotBookings.map((booking) => (
                      <button
                        key={booking.id}
                        onClick={() => onBookingClick?.(booking.id)}
                        className={cn(
                          "w-full text-left text-xs p-1 rounded",
                          booking.status === 'ACCEPTED' && "bg-teal-100 text-teal-800",
                          booking.status === 'PENDING' && "bg-amber-100 text-amber-800",
                          booking.status === 'CANCELLED' && "bg-gray-100 text-gray-400 line-through"
                        )}
                      >
                        {booking.title}
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// Availability Configuration
// ============================================

export interface AvailabilityConfig {
  days: number[] // 0 = Sunday, 1 = Monday, etc.
  startTime: string // "09:00"
  endTime: string // "17:00"
}

export function generateSlots(
  config: AvailabilityConfig,
  startDate: Date,
  endDate: Date,
  intervalMinutes: number = 30,
  existingBookings: Array<{ startTime: Date; endTime: Date }> = []
): TimeSlot[] {
  const slots: TimeSlot[] = []
  let currentDate = startDate

  while (isBefore(currentDate, endDate)) {
    const dayOfWeek = currentDate.getDay()
    
    if (config.days.includes(dayOfWeek)) {
      const [startHour, startMin] = config.startTime.split(':').map(Number)
      const [endHour, endMin] = config.endTime.split(':').map(Number)

      let slotTime = setMinutes(setHours(currentDate, startHour), startMin)
      const endSlotTime = setMinutes(setHours(currentDate, endHour), endMin)

      while (isBefore(slotTime, endSlotTime)) {
        const slotEndTime = addMinutes(slotTime, intervalMinutes)

        // Check if slot conflicts with existing bookings
        const isBooked = existingBookings.some(
          b => isBefore(b.startTime, slotEndTime) && isAfter(b.endTime, slotTime)
        )

        // Don't show past slots
        const isPast = isBefore(slotTime, new Date())

        slots.push({
          time: new Date(slotTime),
          available: !isBooked && !isPast
        })

        slotTime = addMinutes(slotTime, intervalMinutes)
      }
    }

    currentDate = addDays(currentDate, 1)
  }

  return slots
}

// Export everything
export default {
  BookingFlow,
  CalendarView,
  generateSlots,
}
