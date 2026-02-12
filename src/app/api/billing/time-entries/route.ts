import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/billing/time-entries - List time entries
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    const matterId = searchParams.get('matterId')
    const userId = searchParams.get('userId')
    const isBilled = searchParams.get('isBilled')

    // Single time entry fetch
    if (id) {
      const entry = await db.timeEntry.findUnique({
        where: { id },
        include: {
          matter: true,
          user: true,
          invoice: true,
        },
      })
      
      if (!entry) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Time entry not found' } },
          { status: 404 }
        )
      }
      
      return NextResponse.json({ success: true, data: entry })
    }

    // List time entries
    const where: any = {}
    if (matterId) where.matterId = matterId
    if (userId) where.userId = userId
    if (isBilled !== undefined) where.isBilled = isBilled === 'true'

    const entries = await db.timeEntry.findMany({
      where,
      include: {
        matter: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
          }
        },
      },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json({ success: true, data: entries })
  } catch (error) {
    console.error('Error fetching time entries:', error)
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch time entries' } },
      { status: 500 }
    )
  }
}

// POST /api/billing/time-entries - Create time entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { matterId, userId, date, description, hours, rate, isBillable } = body

    if (!matterId || !userId || !hours || !description) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Matter, user, hours, and description are required' } },
        { status: 400 }
      )
    }

    const entry = await db.timeEntry.create({
      data: {
        matterId,
        userId,
        date: new Date(date),
        description,
        hours,
        rate: rate || 0,
        isBillable: isBillable !== false,
        isBilled: false,
      },
      include: {
        matter: true,
        user: true,
      }
    })

    return NextResponse.json({ success: true, data: entry })
  } catch (error) {
    console.error('Error creating time entry:', error)
    return NextResponse.json(
      { success: false, error: { code: 'CREATE_ERROR', message: 'Failed to create time entry' } },
      { status: 500 }
    )
  }
}

// PATCH /api/billing/time-entries - Update time entry
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Time entry ID is required' } },
        { status: 400 }
      )
    }

    // Handle date field
    if (updateData.date) {
      updateData.date = new Date(updateData.date)
    }

    const entry = await db.timeEntry.update({
      where: { id },
      data: updateData,
      include: {
        matter: true,
        user: true,
      },
    })

    return NextResponse.json({ success: true, data: entry })
  } catch (error: any) {
    console.error('Error updating time entry:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Time entry not found' } },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_ERROR', message: 'Failed to update time entry' } },
      { status: 500 }
    )
  }
}

// DELETE /api/billing/time-entries - Delete time entry
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Time entry ID is required' } },
        { status: 400 }
      )
    }

    await db.timeEntry.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, data: { id } })
  } catch (error: any) {
    console.error('Error deleting time entry:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Time entry not found' } },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { success: false, error: { code: 'DELETE_ERROR', message: 'Failed to delete time entry' } },
      { status: 500 }
    )
  }
}
