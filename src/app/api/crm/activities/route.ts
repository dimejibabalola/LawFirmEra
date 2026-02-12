import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/crm/activities - List all activities
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    const companyId = searchParams.get('companyId')
    const contactId = searchParams.get('contactId')
    const dealId = searchParams.get('dealId')

    const where: Record<string, unknown> = {}
    
    if (type && type !== 'all') {
      where.type = type
    }
    
    if (companyId) {
      where.companyId = companyId
    }
    
    if (contactId) {
      where.contactId = contactId
    }
    
    if (dealId) {
      where.dealId = dealId
    }

    const activities = await db.cRMActivity.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
          }
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
        deal: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    return NextResponse.json({ activities })
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}

// POST /api/crm/activities - Create a new activity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const activity = await db.cRMActivity.create({
      data: {
        companyId: body.companyId || null,
        contactId: body.contactId || null,
        dealId: body.dealId || null,
        type: body.type,
        title: body.title,
        description: body.description || null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        completedAt: body.completedAt ? new Date(body.completedAt) : null,
        outcome: body.outcome || null,
        duration: body.duration || null,
        owner: body.owner || null,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          }
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    })

    return NextResponse.json({ activity }, { status: 201 })
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    )
  }
}

// PATCH /api/crm/activities - Update an activity (e.g., mark complete)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    const activity = await db.cRMActivity.update({
      where: { id },
      data: {
        ...updates,
        completedAt: updates.completedAt ? new Date(updates.completedAt) : null,
        dueDate: updates.dueDate ? new Date(updates.dueDate) : undefined,
      },
    })

    return NextResponse.json({ activity })
  } catch (error) {
    console.error('Error updating activity:', error)
    return NextResponse.json(
      { error: 'Failed to update activity' },
      { status: 500 }
    )
  }
}
