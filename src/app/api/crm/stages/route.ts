import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/crm/stages - List all deal stages
export async function GET() {
  try {
    const stages = await db.dealStage.findMany({
      orderBy: {
        position: 'asc',
      },
      include: {
        _count: {
          select: { deals: true }
        }
      }
    })

    return NextResponse.json({ stages })
  } catch (error) {
    console.error('Error fetching stages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stages' },
      { status: 500 }
    )
  }
}

// POST /api/crm/stages - Create a new stage (admin only typically)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get the highest position
    const maxPosition = await db.dealStage.aggregate({
      _max: { position: true }
    })
    
    const position = body.position ?? (maxPosition._max.position ?? -1) + 1

    const stage = await db.dealStage.create({
      data: {
        name: body.name,
        color: body.color || '#6B7280',
        probability: body.probability ?? 20,
        position,
        isDefault: body.isDefault ?? false,
        isClosed: body.isClosed ?? false,
      },
    })

    return NextResponse.json({ stage }, { status: 201 })
  } catch (error) {
    console.error('Error creating stage:', error)
    return NextResponse.json(
      { error: 'Failed to create stage' },
      { status: 500 }
    )
  }
}

// PATCH /api/crm/stages - Update stage order or properties
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    const stage = await db.dealStage.update({
      where: { id },
      data: updates,
    })

    return NextResponse.json({ stage })
  } catch (error) {
    console.error('Error updating stage:', error)
    return NextResponse.json(
      { error: 'Failed to update stage' },
      { status: 500 }
    )
  }
}
