import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/crm/deals - List all deals
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const stageId = searchParams.get('stageId')
    const companyId = searchParams.get('companyId')

    const where: Record<string, unknown> = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (stageId) {
      where.stageId = stageId
    }
    
    if (companyId) {
      where.companyId = companyId
    }

    const deals = await db.deal.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            industry: true,
          }
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        stage: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ deals })
  } catch (error) {
    console.error('Error fetching deals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deals' },
      { status: 500 }
    )
  }
}

// POST /api/crm/deals - Create a new deal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get default stage if not provided
    let stageId = body.stageId
    if (!stageId) {
      const defaultStage = await db.dealStage.findFirst({
        where: { isDefault: true },
        orderBy: { position: 'asc' }
      }) || await db.dealStage.findFirst({
        orderBy: { position: 'asc' }
      })
      stageId = defaultStage?.id
    }

    const deal = await db.deal.create({
      data: {
        companyId: body.companyId,
        contactId: body.contactId || null,
        name: body.name,
        description: body.description || null,
        value: body.value || null,
        expectedCloseDate: body.expectedCloseDate ? new Date(body.expectedCloseDate) : null,
        stageId: stageId!,
        probability: body.probability || 20,
        status: body.status || 'OPEN',
        type: body.type || 'NEW_BUSINESS',
        source: body.source || null,
        owner: body.owner || null,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          }
        },
        stage: true,
      }
    })

    return NextResponse.json({ deal }, { status: 201 })
  } catch (error) {
    console.error('Error creating deal:', error)
    return NextResponse.json(
      { error: 'Failed to create deal' },
      { status: 500 }
    )
  }
}
