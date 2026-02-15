import { BaseCalendarProvider, CalendarEvent, SyncResult } from "./base"
import { db } from "@/lib/db"

export class CalComProvider extends BaseCalendarProvider {
  async connect(): Promise<boolean> {
    return true
  }

  async disconnect(): Promise<void> {}

  async syncEvents(start: Date, end: Date): Promise<SyncResult> {
    const bookings = await db.calBooking.findMany({
      where: {
        startTime: { gte: start, lte: end },
        status: { not: "CANCELLED" },
      },
      include: {
        eventType: true,
        attendees: true,
      },
      orderBy: { startTime: "asc" },
    })

    const events: CalendarEvent[] = bookings.map((booking) => ({
      id: booking.id,
      title: booking.title,
      description: booking.description || booking.eventType?.description || undefined,
      location: booking.location || undefined,
      startAt: booking.startTime,
      endAt: booking.endTime,
      isAllDay: false,
      status: booking.status === "ACCEPTED" ? "CONFIRMED" : "TENTATIVE",
      organizer: undefined,
      attendees: booking.attendees.map((a) => ({
        email: a.email,
        name: a.name,
        status: "accepted",
      })),
      calendarId: "calcom",
    }))

    return { events, hasMore: false }
  }

  async createEvent(event: Partial<CalendarEvent>): Promise<{ id: string }> {
    if (!event.title || !event.startAt || !event.endAt) {
      throw new Error("Missing required event fields")
    }

    const eventTypes = await db.calEventType.findFirst({
      where: { hidden: false },
    })

    if (!eventTypes) {
      throw new Error("No event types available")
    }

    const booking = await db.calBooking.create({
      data: {
        uid: crypto.randomUUID().replace(/-/g, "").substring(0, 16),
        title: event.title,
        description: event.description,
        startTime: event.startAt,
        endTime: event.endAt,
        location: event.location,
        status: "ACCEPTED",
        eventTypeId: eventTypes.id,
        userId: eventTypes.userId,
      },
    })

    return { id: booking.id }
  }

  async updateEvent(id: string, event: Partial<CalendarEvent>): Promise<void> {
    const updateData: any = {}

    if (event.title) updateData.title = event.title
    if (event.description) updateData.description = event.description
    if (event.location) updateData.location = event.location
    if (event.startAt) updateData.startTime = event.startAt
    if (event.endAt) updateData.endTime = event.endAt

    await db.calBooking.update({
      where: { id },
      data: updateData,
    })
  }

  async deleteEvent(id: string): Promise<void> {
    await db.calBooking.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    })
  }
}
