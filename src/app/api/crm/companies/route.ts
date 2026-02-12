import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/crm/companies - List all companies
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { industry: { contains: search } },
      ]
    }

    const companies = await db.cRMCompany.findMany({
      where,
      include: {
        _count: {
          select: { contacts: true, deals: true }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ companies })
  } catch (error) {
    console.error('Error fetching companies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    )
  }
}

// POST /api/crm/companies - Create a new company
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const company = await db.cRMCompany.create({
      data: {
        name: body.name,
        domain: body.domain || null,
        website: body.website || null,
        industry: body.industry || null,
        employeeCount: body.employeeCount || null,
        annualRevenue: body.annualRevenue || null,
        address: body.address || null,
        city: body.city || null,
        state: body.state || null,
        country: body.country || 'USA',
        phone: body.phone || null,
        linkedinUrl: body.linkedinUrl || null,
        twitterHandle: body.twitterHandle || null,
        description: body.description || null,
        owner: body.owner || null,
        status: body.status || 'TARGET',
        tier: body.tier || 'TIER_3',
        source: body.source || null,
      },
    })

    return NextResponse.json({ company }, { status: 201 })
  } catch (error) {
    console.error('Error creating company:', error)
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    )
  }
}
