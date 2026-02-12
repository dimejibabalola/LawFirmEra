import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/crm/contacts - List all contacts
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const companyId = searchParams.get('companyId')

    const where: Record<string, unknown> = {}
    
    if (status && status !== 'all') {
      where.leadStatus = status
    }
    
    if (companyId) {
      where.companyId = companyId
    }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
      ]
    }

    const contacts = await db.cRMContact.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            industry: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ contacts })
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
}

// POST /api/crm/contacts - Create a new contact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const contact = await db.cRMContact.create({
      data: {
        companyId: body.companyId,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email || null,
        phone: body.phone || null,
        mobile: body.mobile || null,
        title: body.title || null,
        department: body.department || null,
        linkedinUrl: body.linkedinUrl || null,
        twitterHandle: body.twitterHandle || null,
        isPrimary: body.isPrimary || false,
        leadStatus: body.leadStatus || 'NEW',
        leadSource: body.leadSource || null,
        owner: body.owner || null,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    return NextResponse.json({ contact }, { status: 201 })
  } catch (error) {
    console.error('Error creating contact:', error)
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    )
  }
}
