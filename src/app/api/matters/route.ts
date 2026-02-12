import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/matters - List all matters or get single matter
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    const status = searchParams.get('status')
    const practiceArea = searchParams.get('practiceArea')
    const clientId = searchParams.get('clientId')
    const search = searchParams.get('search')

    // Single matter fetch
    if (id) {
      const matter = await db.matter.findUnique({
        where: { id },
        include: {
          client: true,
          leadAttorney: true,
          teamMembers: true,
          tasks: true,
          documents: true,
          timeEntries: true,
          events: true,
          invoices: true,
        },
      })
      
      if (!matter) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Matter not found' } },
          { status: 404 }
        )
      }
      
      return NextResponse.json({ success: true, data: matter })
    }

    // List matters
    const matters = await db.matter.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(practiceArea && { practiceArea: practiceArea as any }),
        ...(clientId && { clientId }),
        ...(search && {
          OR: [
            { title: { contains: search } },
            { matterNumber: { contains: search } },
            { description: { contains: search } },
          ]
        })
      },
      include: {
        client: true,
        leadAttorney: true,
        _count: {
          select: {
            tasks: true,
            documents: true,
            timeEntries: true,
          }
        },
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, data: matters })
  } catch (error) {
    console.error('Error fetching matters:', error)
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch matters' } },
      { status: 500 }
    )
  }
}

// POST /api/matters - Create a new matter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      clientId,
      practiceArea,
      priority,
      leadAttorneyId,
      estimatedHours,
      billingType,
      fixedFeeAmount,
      retainerAmount,
      notes,
      statuteLimitDate
    } = body

    if (!title || !clientId || !leadAttorneyId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Title, client, and lead attorney are required' } },
        { status: 400 }
      )
    }

    // Generate matter number
    const currentYear = new Date().getFullYear()
    const matterCount = await db.matter.count({
      where: {
        createdAt: {
          gte: new Date(currentYear, 0, 1),
          lt: new Date(currentYear + 1, 0, 1)
        }
      }
    })
    const matterNumber = `MAT-${currentYear}-${String(matterCount + 1).padStart(3, '0')}`

    const matter = await db.matter.create({
      data: {
        matterNumber,
        title,
        description,
        clientId,
        practiceArea: practiceArea || 'OTHER',
        priority: priority || 'MEDIUM',
        leadAttorneyId,
        estimatedHours,
        billingType: billingType || 'HOURLY',
        fixedFeeAmount,
        retainerAmount,
        notes,
        statuteLimitDate: statuteLimitDate ? new Date(statuteLimitDate) : null,
        openDate: new Date(),
        status: 'OPEN',
      },
      include: {
        client: true,
        leadAttorney: true,
      }
    })

    // Create activity log
    await db.activity.create({
      data: {
        matterId: matter.id,
        userId: leadAttorneyId,
        action: 'Matter Created',
        description: `Matter ${matterNumber} created: ${title}`,
        entityType: 'matter',
        entityId: matter.id,
      }
    })

    return NextResponse.json({ success: true, data: matter })
  } catch (error) {
    console.error('Error creating matter:', error)
    return NextResponse.json(
      { success: false, error: { code: 'CREATE_ERROR', message: 'Failed to create matter' } },
      { status: 500 }
    )
  }
}

// PATCH /api/matters - Update a matter
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Matter ID is required' } },
        { status: 400 }
      )
    }

    // Handle date fields
    if (updateData.statuteLimitDate) {
      updateData.statuteLimitDate = new Date(updateData.statuteLimitDate)
    }
    if (updateData.closeDate) {
      updateData.closeDate = new Date(updateData.closeDate)
    }

    const matter = await db.matter.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        leadAttorney: true,
      },
    })

    // Create activity log for status changes
    if (updateData.status) {
      await db.activity.create({
        data: {
          matterId: matter.id,
          userId: matter.leadAttorneyId,
          action: 'Status Changed',
          description: `Matter status changed to ${updateData.status}`,
          entityType: 'matter',
          entityId: matter.id,
        }
      })
    }

    return NextResponse.json({ success: true, data: matter })
  } catch (error: any) {
    console.error('Error updating matter:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Matter not found' } },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_ERROR', message: 'Failed to update matter' } },
      { status: 500 }
    )
  }
}

// DELETE /api/matters - Delete a matter
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Matter ID is required' } },
        { status: 400 }
      )
    }

    await db.matter.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, data: { id } })
  } catch (error: any) {
    console.error('Error deleting matter:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Matter not found' } },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { success: false, error: { code: 'DELETE_ERROR', message: 'Failed to delete matter' } },
      { status: 500 }
    )
  }
}
