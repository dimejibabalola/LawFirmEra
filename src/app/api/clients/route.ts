import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/clients - List all clients or get single client
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Single client fetch
    if (id) {
      const client = await db.client.findUnique({
        where: { id },
        include: {
          matters: {
            include: {
              leadAttorney: true,
            },
          },
          contacts: true,
          trustAccounts: true,
          invoices: true,
          documents: true,
        },
      })
      
      if (!client) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Client not found' } },
          { status: 404 }
        )
      }
      
      return NextResponse.json({ success: true, data: client })
    }

    // List clients
    const clients = await db.client.findMany({
      where: {
        ...(type && { clientType: type as any }),
        ...(status && { status: status as any }),
        ...(search && {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { companyName: { contains: search } },
            { email: { contains: search } },
          ]
        })
      },
      include: {
        matters: {
          select: {
            id: true,
            title: true,
            status: true,
            practiceArea: true,
          }
        },
        contacts: true,
        _count: {
          select: {
            matters: true,
            documents: true,
          }
        },
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, data: clients })
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch clients' } },
      { status: 500 }
    )
  }
}

// POST /api/clients - Create a new client
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      companyName,
      firstName,
      lastName,
      email,
      phone,
      mobile,
      address,
      city,
      state,
      zipCode,
      country,
      clientType,
      industry,
      source,
      notes
    } = body

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Email, first name, and last name are required' } },
        { status: 400 }
      )
    }

    const client = await db.client.create({
      data: {
        companyName,
        firstName,
        lastName,
        email,
        phone,
        mobile,
        address,
        city,
        state,
        zipCode,
        country: country || 'USA',
        clientType: clientType || 'INDIVIDUAL',
        industry,
        source,
        notes,
        status: 'ACTIVE',
      }
    })

    return NextResponse.json({ success: true, data: client })
  } catch (error: any) {
    console.error('Error creating client:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: { code: 'DUPLICATE_ERROR', message: 'A client with this email already exists' } },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { success: false, error: { code: 'CREATE_ERROR', message: 'Failed to create client' } },
      { status: 500 }
    )
  }
}

// PATCH /api/clients - Update a client
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Client ID is required' } },
        { status: 400 }
      )
    }

    const client = await db.client.update({
      where: { id },
      data: updateData,
      include: {
        matters: true,
        contacts: true,
      }
    })

    return NextResponse.json({ success: true, data: client })
  } catch (error: any) {
    console.error('Error updating client:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Client not found' } },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_ERROR', message: 'Failed to update client' } },
      { status: 500 }
    )
  }
}

// DELETE /api/clients - Delete a client
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Client ID is required' } },
        { status: 400 }
      )
    }

    await db.client.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, data: { id } })
  } catch (error: any) {
    console.error('Error deleting client:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Client not found' } },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { success: false, error: { code: 'DELETE_ERROR', message: 'Failed to delete client' } },
      { status: 500 }
    )
  }
}
