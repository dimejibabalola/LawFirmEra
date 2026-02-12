import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/events - List calendar events or get single event
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    const userId = searchParams.get('userId')
    const matterId = searchParams.get('matterId')
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    // Single event fetch
    if (id) {
      const event = await db.event.findUnique({
        where: { id },
        include: {
          matter: true,
          user: true,
        },
      })
      
      if (!event) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } },
          { status: 404 }
        )
      }
      
      return NextResponse.json({ success: true, data: event })
    }

    // List events
    const events = await db.event.findMany({
      where: {
        ...(userId && { userId }),
        ...(matterId && { matterId }),
        ...(start && end && {
          OR: [
            {
              startAt: {
                gte: new Date(start),
                lte: new Date(end)
              }
            },
            {
              endAt: {
                gte: new Date(start),
                lte: new Date(end)
              }
            },
            {
              AND: [
                { startAt: { lte: new Date(start) } },
                { endAt: { gte: new Date(end) } }
              ]
            }
          ]
        }),
      },
      include: {
        matter: true,
        user: true,
      },
      orderBy: { startAt: 'asc' }
    })

    return NextResponse.json({ success: true, data: events })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch events' } },
      { status: 500 }
    )
  }
}

// POST /api/events - Create event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, userId, matterId, startAt, endAt, location, eventType, isAllDay, reminder } = body

    if (!title || !userId || !startAt || !endAt) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Title, user, start and end times are required' } },
        { status: 400 }
      )
    }

    const event = await db.event.create({
      data: {
        title,
        description,
        userId,
        matterId,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        location,
        eventType: eventType || 'OTHER',
        isAllDay: isAllDay || false,
        reminder,
        status: 'SCHEDULED',
      },
      include: {
        matter: true,
        user: true,
      }
    })

    return NextResponse.json({ success: true, data: event })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { success: false, error: { code: 'CREATE_ERROR', message: 'Failed to create event' } },
      { status: 500 }
    )
  }
}

// PATCH /api/events - Update event
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Event ID is required' } },
        { status: 400 }
      )
    }

    // Handle date fields
    if (updateData.startAt) {
      updateData.startAt = new Date(updateData.startAt)
    }
    if (updateData.endAt) {
      updateData.endAt = new Date(updateData.endAt)
    }

    const event = await db.event.update({
      where: { id },
      data: updateData,
      include: {
        matter: true,
        user: true,
      },
    })

    return NextResponse.json({ success: true, data: event })
  } catch (error: any) {
    console.error('Error updating event:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_ERROR', message: 'Failed to update event' } },
      { status: 500 }
    )
  }
}

// DELETE /api/events - Delete event
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Event ID is required' } },
        { status: 400 }
      )
    }

    await db.event.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, data: { id } })
  } catch (error: any) {
    console.error('Error deleting event:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { success: false, error: { code: 'DELETE_ERROR', message: 'Failed to delete event' } },
      { status: 500 }
    )
  }
}
