"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { Prisma } from "@prisma/client"

// ============================================
// EVENT TYPES
// ============================================

export async function getEventTypes(userId?: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const targetUserId = userId || session.user.id

  const eventTypes = await db.calEventType.findMany({
    where: { userId: targetUserId },
    orderBy: { position: "asc" },
  })

  return eventTypes
}

export async function getEventType(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const eventType = await db.calEventType.findUnique({
    where: { id },
    include: { schedule: true },
  })

  return eventType
}

export async function createEventType(data: {
  title: string
  slug: string
  description?: string
  length: number
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
}) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const eventType = await db.calEventType.create({
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description,
      length: data.length,
      price: data.price || 0,
      currency: data.currency || "USD",
      hidden: data.hidden || false,
      schedulingType: data.schedulingType || "ONE_ON_ONE",
      slotDuration: data.slotDuration,
      minimumBookingNotice: data.minimumBookingNotice,
      beforeEventBuffer: data.beforeEventBuffer || 0,
      afterEventBuffer: data.afterEventBuffer || 0,
      requiresConfirmation: data.requiresConfirmation || false,
      scheduleId: data.scheduleId,
      userId: session.user.id,
    },
  })

  revalidatePath("/scheduling")
  return eventType
}

export async function updateEventType(
  id: string,
  data: Partial<{
    title: string
    slug: string
    description: string
    length: number
    price: number
    currency: string
    hidden: boolean
    schedulingType: string
    slotDuration: number
    minimumBookingNotice: number
    beforeEventBuffer: number
    afterEventBuffer: number
    requiresConfirmation: boolean
    scheduleId: string
    position: number
  }>
) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const eventType = await db.calEventType.update({
    where: { id },
    data,
  })

  revalidatePath("/scheduling")
  return eventType
}

export async function deleteEventType(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  await db.calEventType.delete({
    where: { id },
  })

  revalidatePath("/scheduling")
  return { success: true }
}

// ============================================
// BOOKINGS
// ============================================

export async function getBookings(filters?: {
  userId?: string
  eventTypeId?: string
  startDate?: Date
  endDate?: Date
  status?: string
}) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const where: Prisma.CalBookingWhereInput = {}

  if (filters?.userId) {
    where.userId = filters.userId
  }
  if (filters?.eventTypeId) {
    where.eventTypeId = filters.eventTypeId
  }
  if (filters?.status) {
    where.status = filters.status
  }
  if (filters?.startDate || filters?.endDate) {
    where.startTime = {}
    if (filters?.startDate) {
      where.startTime.gte = filters.startDate
    }
    if (filters?.endDate) {
      where.startTime.lte = filters.endDate
    }
  }

  const bookings = await db.calBooking.findMany({
    where,
    include: {
      eventType: true,
      attendees: true,
    },
    orderBy: { startTime: "asc" },
  })

  return bookings
}

export async function getBooking(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const booking = await db.calBooking.findUnique({
    where: { id },
    include: {
      eventType: true,
      attendees: true,
    },
  })

  return booking
}

export async function createBooking(data: {
  eventTypeId: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  location?: string
  matterId?: string
  attendees: Array<{
    name: string
    email: string
    phone?: string
    timeZone: string
  }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const uid = crypto.randomUUID().replace(/-/g, "").substring(0, 16)

  const booking = await db.calBooking.create({
    data: {
      uid,
      title: data.title,
      description: data.description,
      startTime: data.startTime,
      endTime: data.endTime,
      location: data.location,
      matterId: data.matterId,
      eventTypeId: data.eventTypeId,
      userId: session.user.id,
      status: "ACCEPTED",
      attendees: {
        create: data.attendees.map((a) => ({
          name: a.name,
          email: a.email,
          phone: a.phone,
          timeZone: a.timeZone,
        })),
      },
    },
    include: {
      eventType: true,
      attendees: true,
    },
  })

  revalidatePath("/scheduling")
  revalidatePath("/calendar")
  return booking
}

export async function updateBooking(
  id: string,
  data: Partial<{
    title: string
    description: string
    startTime: Date
    endTime: Date
    location: string
    status: string
    matterId: string
  }>
) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const booking = await db.calBooking.update({
    where: { id },
    data,
    include: {
      eventType: true,
      attendees: true,
    },
  })

  revalidatePath("/scheduling")
  revalidatePath("/calendar")
  return booking
}

export async function cancelBooking(id: string, reason?: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const booking = await db.calBooking.update({
    where: { id },
    data: {
      status: "CANCELLED",
      cancellationReason: reason,
      cancelledAt: new Date(),
    },
    include: {
      eventType: true,
      attendees: true,
    },
  })

  revalidatePath("/scheduling")
  revalidatePath("/calendar")
  return booking
}

export async function confirmBooking(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const booking = await db.calBooking.update({
    where: { id },
    data: {
      status: "ACCEPTED",
    },
    include: {
      eventType: true,
      attendees: true,
    },
  })

  revalidatePath("/scheduling")
  revalidatePath("/calendar")
  return booking
}

// ============================================
// SCHEDULES & AVAILABILITY
// ============================================

export async function getSchedules(userId?: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const targetUserId = userId || session.user.id

  const schedules = await db.calSchedule.findMany({
    where: { userId: targetUserId },
    include: {
      availability: true,
    },
    orderBy: { isDefault: "desc" },
  })

  return schedules
}

export async function getSchedule(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const schedule = await db.calSchedule.findUnique({
    where: { id },
    include: {
      availability: true,
      eventTypes: true,
    },
  })

  return schedule
}

export async function createSchedule(data: {
  name: string
  timeZone: string
  isDefault?: boolean
  availability: Array<{
    days: number[]
    startTime: string
    endTime: string
  }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  if (data.isDefault) {
    await db.calSchedule.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    })
  }

  const schedule = await db.calSchedule.create({
    data: {
      name: data.name,
      timeZone: data.timeZone,
      isDefault: data.isDefault || false,
      userId: session.user.id,
      availability: {
        create: data.availability.map((a) => ({
          days: JSON.stringify(a.days),
          startTime: a.startTime,
          endTime: a.endTime,
        })),
      },
    },
    include: {
      availability: true,
    },
  })

  revalidatePath("/scheduling")
  return schedule
}

export async function updateSchedule(
  id: string,
  data: Partial<{
    name: string
    timeZone: string
    isDefault: boolean
  }>
) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  if (data.isDefault) {
    await db.calSchedule.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    })
  }

  const schedule = await db.calSchedule.update({
    where: { id },
    data,
    include: {
      availability: true,
    },
  })

  revalidatePath("/scheduling")
  return schedule
}

export async function deleteSchedule(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const eventTypesUsingSchedule = await db.calEventType.count({
    where: { scheduleId: id },
  })

  if (eventTypesUsingSchedule > 0) {
    throw new Error("Cannot delete schedule that is in use by event types")
  }

  await db.calAvailability.deleteMany({
    where: { scheduleId: id },
  })

  await db.calSchedule.delete({
    where: { id },
  })

  revalidatePath("/scheduling")
  return { success: true }
}

export async function updateAvailability(
  scheduleId: string,
  availability: Array<{
    id?: string
    days: number[]
    startTime: string
    endTime: string
  }>
) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  await db.calAvailability.deleteMany({
    where: { scheduleId },
  })

  const created = await db.calAvailability.createMany({
    data: availability.map((a) => ({
      days: JSON.stringify(a.days),
      startTime: a.startTime,
      endTime: a.endTime,
      scheduleId,
    })),
  })

  revalidatePath("/scheduling")
  return { success: true, count: created.count }
}

// ============================================
// AVAILABILITY SLOTS GENERATION
// ============================================

export async function getAvailableSlots(
  eventTypeId: string,
  startDate: Date,
  endDate: Date
) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const eventType = await db.calEventType.findUnique({
    where: { id: eventTypeId },
    include: {
      schedule: {
        include: {
          availability: true,
        },
      },
    },
  })

  if (!eventType) {
    throw new Error("Event type not found")
  }

  const existingBookings = await db.calBooking.findMany({
    where: {
      eventTypeId,
      startTime: { gte: startDate, lte: endDate },
      status: { not: "CANCELLED" },
    },
    select: {
      startTime: true,
      endTime: true,
    },
  })

  const slots: Array<{ time: Date; available: boolean }> = []
  const availability = eventType.schedule?.availability || []

  let currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay()

    for (const avail of availability) {
      const days = JSON.parse(avail.days) as number[]
      if (!days.includes(dayOfWeek)) continue

      const [startHour, startMin] = avail.startTime.split(":").map(Number)
      const [endHour, endMin] = avail.endTime.split(":").map(Number)

      const slotStart = new Date(currentDate)
      slotStart.setHours(startHour, startMin, 0, 0)

      const slotEnd = new Date(currentDate)
      slotEnd.setHours(endHour, endMin, 0, 0)

      let slotTime = new Date(slotStart)
      while (slotTime < slotEnd) {
        const slotEndTime = new Date(slotTime)
        slotEndTime.setMinutes(slotEndTime.getMinutes() + eventType.length)

        const isBooked = existingBookings.some((b) => {
          return (
            slotTime >= b.startTime &&
            slotTime < b.endTime &&
            slotEndTime > b.startTime &&
            slotEndTime <= b.endTime
          )
        })

        const isPast = slotTime < new Date()

        slots.push({
          time: new Date(slotTime),
          available: !isBooked && !isPast,
        })

        slotTime = slotEndTime
      }
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return slots
}

// ============================================
// STATS & SUMMARY
// ============================================

export async function getSchedulingStats() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const [eventTypesCount, upcomingBookings, pendingBookings, totalBookings] =
    await Promise.all([
      db.calEventType.count({
        where: { userId: session.user.id },
      }),
      db.calBooking.count({
        where: {
          userId: session.user.id,
          startTime: { gte: new Date() },
          status: "ACCEPTED",
        },
      }),
      db.calBooking.count({
        where: {
          userId: session.user.id,
          status: "PENDING",
        },
      }),
      db.calBooking.count({
        where: {
          userId: session.user.id,
          status: "ACCEPTED",
        },
      }),
    ])

  return {
    eventTypesCount,
    upcomingBookings,
    pendingBookings,
    totalBookings,
  }
}